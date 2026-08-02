import { NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Parse OCR text from a purchase/distributor invoice.
 * Looks for lines containing:
 *   Medicine Name | Qty | Batch | Expiry | Purchase Price | MRP
 */
function parseInvoiceText(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const items = [];

    // Patterns to detect price values (₹ or Rs or plain number)
    const pricePattern = /(?:rs\.?|₹)?\s*(\d+(?:\.\d{1,2})?)/i;
    // Expiry: MM/YY, MM/YYYY, MMM-YY etc.
    const expiryPattern = /\b(\d{2})[\/\-](\d{2,4})\b/;
    // Batch: alphanumeric 4-12 chars
    const batchPattern = /\b([A-Z]{1,4}\d{4,8})\b/i;
    // Quantity
    const qtyPattern = /\b(\d{1,4})\s*(?:tab|cap|nos|pcs|qty|x|strips?)?\b/i;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip header lines, totals, etc.
        if (/^(sl\.?|sr\.?|no\.?|total|sub.?total|sgst|cgst|igst|gst|amount|batch|mrp|hsn|invoice|date|bill|supplier|dist)/i.test(line)) continue;
        if (line.length < 5) continue;

        // Extract numbers from line (we'll use positional heuristics)
        const numbers = [...line.matchAll(/\d+(?:\.\d{1,2})?/g)].map(m => parseFloat(m[0]));
        if (numbers.length < 2) continue; // need at least qty + one price

        // Try to identify medicine name (leading text before numbers)
        const nameMatch = line.match(/^([A-Za-z][A-Za-z0-9\s\-\.]{2,40?}?)(?:\s+\d|\s+[A-Z]{1,4}\d)/);
        if (!nameMatch) continue;

        const medicineName = nameMatch[1].trim();
        if (medicineName.length < 3) continue;

        // Heuristic: In a typical invoice line, largest price-like number ≥ 10 is MRP
        // and second largest ≥ 5 is purchase price, smallest feasible is qty
        const priceNumbers = numbers.filter(n => n >= 0.5 && n <= 100000);

        let qty = 1, purchasePrice = 0, mrp = 0;

        if (priceNumbers.length >= 3) {
            // Assume: qty (smallest reasonable), purchase (middle), mrp (highest)
            const sorted = [...priceNumbers].sort((a, b) => a - b);
            qty = Math.round(sorted[0]) || 1;
            purchasePrice = sorted[sorted.length - 2] || 0;
            mrp = sorted[sorted.length - 1] || 0;
        } else if (priceNumbers.length === 2) {
            purchasePrice = priceNumbers[0];
            mrp = priceNumbers[1];
            qty = 1;
        }

        // Extract batch and expiry if found
        const batchMatch = line.match(batchPattern);
        const expiryMatch = line.match(expiryPattern);

        let expiryDate = null;
        if (expiryMatch) {
            const month = parseInt(expiryMatch[1]);
            const year = parseInt(expiryMatch[2]);
            const fullYear = year < 100 ? 2000 + year : year;
            expiryDate = new Date(fullYear, month - 1, 28); // last safe day of month
        }

        if (mrp > 0 && purchasePrice > 0 && purchasePrice <= mrp) {
            items.push({
                medicineName,
                qty,
                purchasePrice,
                mrp,
                sellingPrice: parseFloat((mrp * 0.90).toFixed(2)), // 10% off MRP
                margin: parseFloat(((mrp * 0.90) - purchasePrice).toFixed(2)),
                batchNumber: batchMatch ? batchMatch[1] : null,
                expiryDate,
            });
        }
    }

    return items;
}

/**
 * POST /api/admin/purchase-invoice
 * 
 * Accepts a purchase invoice image upload, runs OCR, parses medicines,
 * and auto-updates Product inventory + buying/selling prices.
 * 
 * Body: FormData with:
 *   - image: File (PNG, JPG, PDF)
 *   - autoApply: "true"/"false" — if true, immediately updates DB
 */
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const imageFile = formData.get('image');
        const autoApply = formData.get('autoApply') === 'true';

        if (!imageFile) {
            return NextResponse.json({ error: 'No invoice image provided' }, { status: 400 });
        }

        const isPdf = imageFile.type === 'application/pdf' || imageFile.name.toLowerCase().endsWith('.pdf');

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let text = "";

        if (isPdf) {
            // 1a. Parse digital PDF directly using pdf2json to avoid DOMMatrix error
            try {
                text = await new Promise((resolve, reject) => {
                    const PDFParser = require("pdf2json");
                    const pdfParser = new PDFParser(null, 1);
                    
                    pdfParser.on("pdfParser_dataError", errData => reject(new Error(errData.parserError)));
                    pdfParser.on("pdfParser_dataReady", pdfData => {
                        resolve(pdfParser.getRawTextContent());
                    });
                    
                    pdfParser.parseBuffer(buffer);
                });
            } catch (err) {
                console.error("PDF Parse error", err);
                return NextResponse.json({ error: 'Failed to parse PDF document: ' + (err.message || err.toString()) }, { status: 400 });
            }
        } else {
            // 1b. Run Tesseract OCR for images
            const worker = await createWorker('eng');
            const result = await worker.recognize(buffer);
            text = result.data.text;
            await worker.terminate();
        }

        // 2. Parse invoice items from extracted text
        const parsedItems = parseInvoiceText(text);

        if (parsedItems.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Could not extract medicine data from invoice. Please check image quality.',
                rawText: text.substring(0, 1000),
                parsedItems: []
            });
        }

        // 3. If autoApply, match medicines in DB and update
        const results = [];

        if (autoApply) {
            for (const item of parsedItems) {
                // Find matching product by name (case-insensitive partial match)
                const product = await prisma.product.findFirst({
                    where: {
                        name: { contains: item.medicineName.split(' ')[0], mode: 'insensitive' }
                    }
                });

                if (!product) {
                    results.push({ ...item, status: 'NOT_FOUND', productId: null });
                    continue;
                }

                // Update Product prices + stock
                await prisma.product.update({
                    where: { id: product.id },
                    data: {
                        buyingPrice: item.purchasePrice,
                        mrp: item.mrp,
                        price: item.sellingPrice,
                        stock: { increment: item.qty },
                        ...(item.batchNumber && { batchNumber: item.batchNumber }),
                        ...(item.expiryDate && { expiryDate: item.expiryDate }),
                    }
                });

                // Upsert PharmacyInventory
                await prisma.pharmacyInventory.upsert({
                    where: { productId: product.id },
                    create: {
                        productId: product.id,
                        purchasePrice: item.purchasePrice,
                        sellingPrice: item.sellingPrice,
                        stock: item.qty,
                        marginPercent: item.mrp > 0
                            ? parseFloat(((item.margin / item.mrp) * 100).toFixed(2))
                            : 0,
                        ...(item.expiryDate && { expiryDate: item.expiryDate }),
                    },
                    update: {
                        purchasePrice: item.purchasePrice,
                        sellingPrice: item.sellingPrice,
                        stock: { increment: item.qty },
                        marginPercent: item.mrp > 0
                            ? parseFloat(((item.margin / item.mrp) * 100).toFixed(2))
                            : 0,
                        ...(item.expiryDate && { expiryDate: item.expiryDate }),
                    }
                });

                // Log the stock entry
                await prisma.stockLog.create({
                    data: {
                        productId: product.id,
                        quantity: item.qty,
                        buyingPrice: item.purchasePrice,
                        type: 'PURCHASE_INVOICE'
                    }
                });

                results.push({ ...item, status: 'UPDATED', productId: product.id, productName: product.name });
            }
        }

        return NextResponse.json({
            success: true,
            message: autoApply
                ? `Processed ${results.filter(r => r.status === 'UPDATED').length}/${parsedItems.length} medicines from invoice`
                : 'Invoice parsed successfully. Review and confirm to apply.',
            parsedItems: autoApply ? results : parsedItems,
            rawText: text.substring(0, 500),
        });

    } catch (error) {
        console.error('[Purchase Invoice API Error]:', error);
        return NextResponse.json({ error: 'Failed to process invoice: ' + error.message }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/purchase-invoice
 * Apply individually confirmed items from the parsed invoice preview.
 */
export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { items } = await req.json();
        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: 'items array required' }, { status: 400 });
        }

        const results = [];

        for (const item of items) {
            const { productId, purchasePrice, mrp, qty, batchNumber, expiryDate } = item;
            let finalProductId = productId;

            const sellingPrice = parseFloat((mrp * 0.90).toFixed(2));
            const margin = parseFloat((sellingPrice - purchasePrice).toFixed(2));
            const marginPercent = mrp > 0 ? parseFloat(((margin / mrp) * 100).toFixed(2)) : 0;

            if (!finalProductId) {
                // Auto-create new product
                const newProduct = await prisma.product.create({
                    data: {
                        name: item.medicineName,
                        category: 'General',
                        price: sellingPrice,
                        buyingPrice: purchasePrice,
                        mrp: mrp,
                        stock: qty,
                        requiresPrescription: false,
                        description: `Auto-created from invoice`,
                        ...(batchNumber && { batchNumber }),
                        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
                    }
                });
                finalProductId = newProduct.id;
            } else {
                // Update existing product
                await prisma.product.update({
                    where: { id: finalProductId },
                    data: {
                        buyingPrice: purchasePrice,
                        mrp,
                        price: sellingPrice,
                        stock: { increment: qty || 0 },
                        ...(batchNumber && { batchNumber }),
                        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
                    }
                });
            }

            await prisma.pharmacyInventory.upsert({
                where: { productId: finalProductId },
                create: { productId: finalProductId, purchasePrice, sellingPrice, stock: qty || 0, marginPercent },
                update: { purchasePrice, sellingPrice, stock: { increment: qty || 0 }, marginPercent }
            });

            await prisma.stockLog.create({
                data: {
                    productId: finalProductId,
                    quantity: qty || 0,
                    buyingPrice: purchasePrice,
                    type: productId ? 'PURCHASE_INVOICE' : 'INITIAL_STOCK'
                }
            });

            results.push({ ...item, sellingPrice, margin, marginPercent, status: productId ? 'UPDATED' : 'CREATED', productId: finalProductId });
        }

        return NextResponse.json({ success: true, results });

    } catch (error) {
        console.error('[Purchase Invoice PATCH Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

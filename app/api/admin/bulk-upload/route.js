import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Papa from "papaparse";

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ error: "No file provided." }, { status: 400 });
        }

        const csvText = await file.text();
        const { data, errors } = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true, // auto convert numbers
        });

        if (errors.length && data.length === 0) {
            return NextResponse.json({ error: "Invalid CSV format.", details: errors }, { status: 400 });
        }

        let createdCount = 0;
        let updatedCount = 0;

        // Process in transactions or batches to support massive imports
        // For standard upload, iterate and upsert. Prisma doesn't natively handle massive nested upserts perfectly, so sequential array mapping helps.
        
        for (const row of data) {
            const name = row.medicine_name || row.name;
            if (!name) continue;

            const mrp = parseFloat(row.mrp) || 0;
            const purchasePrice = parseFloat(row.purchase_price) || parseFloat(row.buyingPrice) || 0;
            const marginPercent = parseFloat(row.margin) || 15; // default 15% margin
            const stock = parseInt(row.stock) || 0;
            const category = row.category || "General";
            const composition = row.composition || null;
            const manufacturer = row.manufacturer || null;
            const packSize = row.pack_size || null;

            // Pricing Engine Logic: selling_price = min(mrp, purchase_price + margin)
            const calculatedPrice = purchasePrice + (purchasePrice * (marginPercent / 100));
            // Ensure we never sell above MRP unless MRP is 0
            const sellingPrice = (mrp > 0 && mrp < calculatedPrice) ? mrp : Math.round(calculatedPrice * 100) / 100;

            // Check if product exists
            let product = await prisma.product.findFirst({
                where: { name: { equals: name, mode: 'insensitive' } },
            });

            if (product) {
                // Update Existing Medicine Master and Fallback Fields
                product = await prisma.product.update({
                    where: { id: product.id },
                    data: {
                        mrp,
                        composition,
                        manufacturer,
                        packSize,
                        price: sellingPrice,
                        stock: stock
                    }
                });
                updatedCount++;
            } else {
                // Create New Medicine Master and Fallback Fields
                product = await prisma.product.create({
                    data: {
                        name,
                        category,
                        description: row.description || `${name} - ${composition || ''} medicine`,
                        image: row.image_url || "https://placehold.co/200",
                        mrp,
                        composition,
                        manufacturer,
                        packSize,
                        price: sellingPrice,
                        stock: stock
                    }
                });
                createdCount++;
            }

            // Sync Pharmacy Inventory
            await prisma.pharmacyInventory.upsert({
                where: { productId: product.id },
                update: {
                    purchasePrice,
                    sellingPrice,
                    marginPercent,
                    stock
                },
                create: {
                    productId: product.id,
                    purchasePrice,
                    sellingPrice,
                    marginPercent,
                    stock
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: `Successfully processed CSV. Created: ${createdCount}, Updated: ${updatedCount}`,
            createdCount,
            updatedCount
        });

    } catch (error) {
        console.error("Bulk Upload Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process bulk upload." }, { status: 500 });
    }
}

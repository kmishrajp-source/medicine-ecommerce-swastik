import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// GET: Fetch all products
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, products });
    } catch (error) {
        console.error("Inventory Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

// POST: Create a new product
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, price, category, image, requiresPrescription, stock, buyingPrice, expiryDate, batchNumber } = body;

        if (!name || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Auto-calculate profit if price is not provided but buyingPrice is
        let finalPrice = parseFloat(price);
        let finalBuyingPrice = parseFloat(buyingPrice) || 0;

        if (!finalPrice && finalBuyingPrice > 0) {
            finalPrice = finalBuyingPrice * 1.18; // 18% Profit
        }

        const product = await prisma.product.create({
            data: {
                name,
                description: description || "",
                price: finalPrice || 0,
                buyingPrice: finalBuyingPrice,
                category,
                image: image || "https://placehold.co/200",
                requiresPrescription: requiresPrescription || false,
                stock: parseInt(stock) || 0,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                batchNumber: batchNumber || null
            }
        });

        // Log initial stock
        if (product.stock > 0) {
            await prisma.stockLog.create({
                data: {
                    productId: product.id,
                    quantity: product.stock,
                    buyingPrice: finalBuyingPrice,
                    type: "INITIAL_STOCK"
                }
            });
        }

        return NextResponse.json({ success: true, product });

    } catch (error) {
        console.error("Inventory Create Error:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}

// PUT: Update a product
export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, name, description, price, category, image, requiresPrescription, stock, buyingPrice, mrp, expiryDate, batchNumber } = body;

        if (!id) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        const mrpVal = parseFloat(mrp) || 0;
        const buyPrice = parseFloat(buyingPrice) || 0;

        // Business Rule: Selling Price = MRP × 0.90 (10% discount always)
        // If MRP is provided, recalculate selling price. Otherwise use manual price.
        const sellingPrice = mrpVal > 0
            ? parseFloat((mrpVal * 0.90).toFixed(2))
            : parseFloat(price) || 0;

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: sellingPrice,
                buyingPrice: buyPrice,
                mrp: mrpVal || undefined,
                category,
                image,
                requiresPrescription,
                stock: parseInt(stock),
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                batchNumber: batchNumber || null
            }
        });

        // Also sync PharmacyInventory
        if (mrpVal > 0 || buyPrice > 0) {
            const margin = sellingPrice - buyPrice;
            await prisma.pharmacyInventory.upsert({
                where: { productId: id },
                create: {
                    productId: id,
                    purchasePrice: buyPrice,
                    sellingPrice,
                    stock: parseInt(stock) || 0,
                    marginPercent: mrpVal > 0 ? parseFloat(((margin / mrpVal) * 100).toFixed(2)) : 0,
                },
                update: {
                    purchasePrice: buyPrice > 0 ? buyPrice : undefined,
                    sellingPrice,
                    marginPercent: mrpVal > 0 ? parseFloat(((margin / mrpVal) * 100).toFixed(2)) : undefined,
                }
            });
        }

        return NextResponse.json({ success: true, product });

    } catch (error) {
        console.error("Inventory Update Error:", error);
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}


// DELETE: Delete a product
export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        await prisma.product.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: "Product deleted successfully" });

    } catch (error) {
        console.error("Inventory Delete Error:", error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}


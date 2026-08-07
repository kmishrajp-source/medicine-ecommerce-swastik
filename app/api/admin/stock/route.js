import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { productId, quantity, buyingPrice, mrp, batchNumber, expiryDate } = body;

        if (!productId || !quantity) {
            return NextResponse.json({ error: "Product ID and Quantity required" }, { status: 400 });
        }

        const qty = parseInt(quantity);
        const buyPrice = parseFloat(buyingPrice) || 0;
        const mrpVal = parseFloat(mrp) || 0;

        // Business Rule: Selling Price = MRP × 0.90 (10% discount on MRP)
        // If MRP not provided, keep existing product MRP
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const effectiveMrp = mrpVal > 0 ? mrpVal : (product.mrp || 0);
        const sellingPrice = effectiveMrp > 0 ? parseFloat((effectiveMrp * 0.90).toFixed(2)) : product.price;
        const margin = buyPrice > 0 && sellingPrice > 0 ? parseFloat((sellingPrice - buyPrice).toFixed(2)) : 0;

        // 1. Log the stock addition
        await prisma.stockLog.create({
            data: {
                productId,
                quantity: qty,
                buyingPrice: buyPrice,
                type: "RESTOCK"
            }
        });

        // 2. Update Product: stock, buyingPrice, price (selling), mrp
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: {
                stock: { increment: qty },
                ...(buyPrice > 0 && { buyingPrice: buyPrice }),
                ...(effectiveMrp > 0 && { mrp: effectiveMrp }),
                ...(sellingPrice > 0 && { price: sellingPrice }),
                ...(batchNumber && { batchNumber }),
                ...(expiryDate && { expiryDate: new Date(expiryDate) }),
            }
        });

        // 3. Upsert PharmacyInventory (operational sync)
        await prisma.pharmacyInventory.upsert({
            where: { productId },
            create: {
                productId,
                purchasePrice: buyPrice,
                sellingPrice,
                stock: qty,
                marginPercent: effectiveMrp > 0 ? parseFloat(((margin / effectiveMrp) * 100).toFixed(2)) : 0,
                ...(expiryDate && { expiryDate: new Date(expiryDate) }),
            },
            update: {
                purchasePrice: buyPrice > 0 ? buyPrice : undefined,
                sellingPrice: sellingPrice > 0 ? sellingPrice : undefined,
                stock: { increment: qty },
                marginPercent: effectiveMrp > 0 ? parseFloat(((margin / effectiveMrp) * 100).toFixed(2)) : undefined,
                ...(expiryDate && { expiryDate: new Date(expiryDate) }),
            }
        });

        return NextResponse.json({
            success: true,
            product: updatedProduct,
            pricing: {
                buyingPrice: buyPrice,
                mrp: effectiveMrp,
                sellingPrice,
                margin,
                marginPercent: effectiveMrp > 0 ? parseFloat(((margin / effectiveMrp) * 100).toFixed(1)) : 0
            }
        });

    } catch (error) {
        console.error("Stock Update Error:", error);
        return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
    }
}

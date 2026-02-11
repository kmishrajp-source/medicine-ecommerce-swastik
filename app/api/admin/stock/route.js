import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { productId, quantity, buyingPrice } = body;

        if (!productId || !quantity) {
            return NextResponse.json({ error: "Product ID and Quantity required" }, { status: 400 });
        }

        const qty = parseInt(quantity);
        const buyPrice = parseFloat(buyingPrice) || 0;

        // 1. Log the stock addition
        await prisma.stockLog.create({
            data: {
                productId,
                quantity: qty,
                buyingPrice: buyPrice,
                type: "RESTOCK"
            }
        });

        // 2. Update Product stock and buying price (if changed)
        // We update buying price to the latest one, or keep average? 
        // For simplicity, let's update current buying price to latest.
        const product = await prisma.product.update({
            where: { id: productId },
            data: {
                stock: { increment: qty },
                buyingPrice: buyPrice > 0 ? buyPrice : undefined // Update buying price if provided
            }
        });

        return NextResponse.json({ success: true, product });

    } catch (error) {
        console.error("Stock Update Error:", error);
        return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
    }
}

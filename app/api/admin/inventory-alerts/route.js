import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Returns items where stock is at or below safety threshold
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const threshold = parseInt(searchParams.get("threshold") || "10");

        const lowStockItems = await prisma.pharmacyInventory.findMany({
            where: { stock: { lte: threshold } },
            include: {
                product: { select: { id: true, name: true, category: true, price: true, brand: true } }
            },
            orderBy: { stock: "asc" }
        });

        const criticalItems = lowStockItems.filter(i => i.stock === 0);
        const lowItems = lowStockItems.filter(i => i.stock > 0 && i.stock <= 5);
        const warningItems = lowStockItems.filter(i => i.stock > 5 && i.stock <= threshold);

        return NextResponse.json({
            success: true,
            summary: {
                critical: criticalItems.length,
                low: lowItems.length,
                warning: warningItems.length,
                total: lowStockItems.length
            },
            items: {
                critical: criticalItems,
                low: lowItems,
                warning: warningItems,
            }
        });
    } catch (error) {
        console.error("Inventory alerts error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch inventory alerts." }, { status: 500 });
    }
}

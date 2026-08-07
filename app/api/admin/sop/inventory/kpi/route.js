import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // KPI 1: Inventory Turnover Ratio = COGS / Avg Inventory
        // Approximation: Total Sales (last 30 days) / Current Inventory Value
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentSales = await prisma.order.aggregate({
            _sum: { total: true },
            where: { createdAt: { gte: thirtyDaysAgo }, status: "Delivered" }
        });

        const allProducts = await prisma.product.findMany({ select: { stock: true, price: true } });
        const currentInventoryValue = allProducts.reduce((sum, p) => sum + (p.stock * p.price), 0);
        
        const sales30d = recentSales._sum.total || 0;
        const turnoverRatio = currentInventoryValue > 0 ? (sales30d / currentInventoryValue).toFixed(2) : 0;

        // KPI 2: Expiry Loss % = (Value of expired items / Total Revenue)
        // Let's find items expired in the last 30 days
        const expiredProducts = await prisma.product.findMany({
            where: { 
                expiryDate: { lte: new Date() },
                stock: { gt: 0 }
            },
            select: { stock: true, price: true }
        });
        
        const expiryLossValue = expiredProducts.reduce((sum, p) => sum + (p.stock * p.price), 0);
        const expiryLossPercent = sales30d > 0 ? ((expiryLossValue / sales30d) * 100).toFixed(2) : 0;

        // KPI 3: Stock Accuracy % 
        // We'll calculate this based on recent StockAdjustments vs Total Items
        const recentAdjustments = await prisma.stockLog.count({
            where: { type: "ADJUSTMENT", createdAt: { gte: thirtyDaysAgo } }
        });
        const totalItems = allProducts.length;
        const accuracyPercent = totalItems > 0 ? (((totalItems - recentAdjustments) / totalItems) * 100).toFixed(2) : 100;

        const kpis = {
            turnoverRatio,
            expiryLossValue,
            expiryLossPercent,
            accuracyPercent,
            totalInventoryValue: currentInventoryValue
        };

        return NextResponse.json({ success: true, kpis });

    } catch (error) {
        console.error("Inventory KPI Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

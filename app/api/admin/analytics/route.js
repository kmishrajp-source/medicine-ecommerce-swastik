import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Fetch Key Metrics
        const totalOrders = await prisma.order.count();
        const totalProducts = await prisma.product.count();

        // 2. Calculate Revenue
        const orders = await prisma.order.findMany({
            where: { isPaid: true }, // Only paid orders count for revenue? Or all? Let's use all for now as 'Sales'
            select: { total: true }
        });
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

        // 3. Calculate Investment (Total Buying Price of all stock ever added)
        const stockLogs = await prisma.stockLog.findMany();
        const totalInvestment = stockLogs.reduce((sum, log) => sum + (log.quantity * log.buyingPrice), 0);

        // 4. Calculate Gross Profit (Revenue - Cost of Goods Sold)
        // This is tricky without exact COGS per item. 
        // Approximate: Revenue - (SoldLimit * AvgBuyingPrice).
        // For now, let's just return Total Revenue and Total Investment.

        // 5. Recent Sales
        const recentSales = await prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } } }
        });

        // 6. Low Stock
        const lowStockProducts = await prisma.product.findMany({
            where: { stock: { lt: 10 } },
            select: { name: true, stock: true }
        });

        return NextResponse.json({
            success: true,
            analytics: {
                totalOrders,
                totalProducts,
                totalRevenue,
                totalInvestment,
                profit: totalRevenue - (totalRevenue * 0.7), // Dummy profit calc or based on investment? 
                // Better Profit Calc: Revenue - Cost of items sold. 
                // Let's rely on simple Revenue vs Investment for now as requested.
                recentSales,
                lowStockProducts
            }
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}

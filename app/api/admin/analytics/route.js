import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

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

        // 7. Detailed Sales Report
        const allSales = await prisma.orderItem.findMany({
            include: {
                order: { select: { createdAt: true, status: true, deliveryCode: true } },
                product: { select: { name: true, buyingPrice: true, stock: true } }
            },
            orderBy: { order: { createdAt: 'desc' } }
        });

        const salesReport = allSales.map(item => {
            const buyingPrice = item.product?.buyingPrice || 0;
            const sellingPrice = item.price; // Price at time of sale
            const profit = (sellingPrice - buyingPrice) * item.quantity;

            return {
                id: item.id,
                date: item.order.createdAt,
                productName: item.product?.name || "Unknown",
                quantity: item.quantity,
                buyingPrice: buyingPrice,
                sellingPrice: sellingPrice,
                profit: profit,
                remainingStock: item.product?.stock || 0,
                status: item.order.status
            };
        });

        // Recalculate Total Profit more accurately
        const accurateProfit = salesReport.reduce((sum, item) => sum + item.profit, 0);

        return NextResponse.json({
            success: true,
            analytics: {
                totalOrders,
                totalProducts,
                totalRevenue,
                totalInvestment,
                profit: accurateProfit, // Use accurate calc
                recentSales,
                lowStockProducts,
                salesReport // New field
            }
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        return NextResponse.json({
            error: "Failed to fetch analytics",
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

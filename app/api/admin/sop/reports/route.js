import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/admin/sop/reports?type=daily|weekly|monthly
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type") || "daily";

        const now = new Date();
        let startDate;
        if (type === "daily") {
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);
        } else if (type === "weekly") {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
        } else {
            startDate = new Date(now);
            startDate.setDate(1); // First day of current month
            startDate.setHours(0, 0, 0, 0);
        }

        const whereDate = { createdAt: { gte: startDate } };

        // 1. Sales Data
        const ordersAgg = await prisma.order.aggregate({
            _sum: { total: true },
            _count: { id: true },
            where: whereDate,
        }).catch(() => ({ _sum: { total: 0 }, _count: { id: 0 } }));

        const deliveredOrders = await prisma.order.aggregate({
            _sum: { total: true },
            _count: { id: true },
            where: { ...whereDate, status: "Delivered" },
        }).catch(() => ({ _sum: { total: 0 }, _count: { id: 0 } }));

        const pendingOrders = await prisma.order.count({
            where: { ...whereDate, status: { in: ["Processing", "Pending"] } },
        }).catch(() => 0);

        // 2. Inventory Alerts
        const lowStockProducts = await prisma.product.findMany({
            where: { stock: { lte: 10 } },
            select: { name: true, stock: true, category: true },
            orderBy: { stock: "asc" },
            take: 20,
        }).catch(() => []);

        const outOfStockCount = await prisma.product.count({
            where: { stock: 0 },
        }).catch(() => 0);

        // 3. Returns
        const returnsCount = await prisma.returnRequest.count({
            where: whereDate,
        }).catch(() => 0);

        const pendingReturns = await prisma.returnRequest.count({
            where: { ...whereDate, status: "Pending" },
        }).catch(() => 0);

        // 4. New Customers
        const newCustomers = await prisma.user.count({
            where: { ...whereDate, role: "USER" },
        }).catch(() => 0);

        // 5. Complaints/Leads
        const newLeads = await prisma.lead.count({
            where: whereDate,
        }).catch(() => 0);

        // 6. Prescriptions Uploaded
        const prescriptions = await prisma.prescription.count({
            where: whereDate,
        }).catch(() => 0);

        // Build top-line report
        const report = {
            type,
            period: { from: startDate.toISOString(), to: now.toISOString() },
            generatedAt: now.toISOString(),
            sales: {
                totalOrders: ordersAgg._count?.id || 0,
                totalRevenue: ordersAgg._sum?.total || 0,
                deliveredOrders: deliveredOrders._count?.id || 0,
                deliveredRevenue: deliveredOrders._sum?.total || 0,
                pendingOrders,
            },
            inventory: {
                lowStockItems: lowStockProducts.length,
                outOfStockItems: outOfStockCount,
                lowStockList: lowStockProducts,
            },
            returns: {
                total: returnsCount,
                pending: pendingReturns,
            },
            customers: {
                new: newCustomers,
                leads: newLeads,
            },
            prescriptions,
        };

        return NextResponse.json({ success: true, report });
    } catch (error) {
        console.error("Reports API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

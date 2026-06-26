import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Count GRNs/receipts today (stock logs of type RESTOCK_GRN)
        const [received, dispatched, pendingOrders] = await Promise.all([
            prisma.stockLog.count({ where: { type: "RESTOCK_GRN", createdAt: { gte: today } } }).catch(() => 0),
            prisma.order.count({ where: { status: "DELIVERED", updatedAt: { gte: today } } }).catch(() => 0),
            prisma.order.count({ where: { status: { in: ["PROCESSING", "CONFIRMED"] } } }).catch(() => 0),
        ]);

        return NextResponse.json({
            success: true,
            stats: {
                received,
                dispatched,
                pending: pendingOrders,
                damaged: 0,  // Damage reports tracked separately
            }
        });
    } catch (error) {
        return NextResponse.json({ success: true, stats: { received: 0, dispatched: 0, pending: 0, damaged: 0 } });
    }
}

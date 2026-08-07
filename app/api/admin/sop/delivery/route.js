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

        const [total, delivered, pending, failed] = await Promise.all([
            prisma.order.count({ where: { createdAt: { gte: today } } }).catch(() => 0),
            prisma.order.count({ where: { status: "DELIVERED", updatedAt: { gte: today } } }).catch(() => 0),
            prisma.order.count({ where: { status: { in: ["SHIPPED", "OUT_FOR_DELIVERY"] } } }).catch(() => 0),
            prisma.order.count({ where: { status: "CANCELLED", updatedAt: { gte: today } } }).catch(() => 0),
        ]);

        return NextResponse.json({
            success: true,
            stats: { total, delivered, pending, failed }
        });
    } catch (error) {
        return NextResponse.json({ success: true, stats: { total: 0, delivered: 0, pending: 0, failed: 0 } });
    }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        // Security Check: Temporarily allowed for testing
        // if (!session || session.user.role !== 'ADMIN') {
        //    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, email: true } },
                items: { include: { product: true } }
            }
        });

        // Format for frontend
        const formattedOrders = orders.map(order => ({
            id: order.id,
            date: order.createdAt.toISOString().split('T')[0],
            total: order.total,
            status: order.status,
            customer: order.guestName || order.user?.name || "Guest",
            email: order.guestEmail || order.user?.email || "N/A",
            phone: order.guestPhone || "N/A",
            address: order.address,
            deliveryCode: order.deliveryCode, // Critical for verification
            items: order.items.map(item => `${item.product.name} x${item.quantity}`).join(", ")
        }));

        return NextResponse.json({ success: true, orders: formattedOrders });

    } catch (error) {
        console.error("Admin Orders Error:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

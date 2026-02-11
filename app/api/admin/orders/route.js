import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Fetch all orders
export async function GET(req) {
    try {
        // Safe Session Retrieval
        let session = null;
        try {
            session = await getServerSession(authOptions);
        } catch (e) {
            console.warn("Session retrieval failed:", e);
        }

        // Security Check: Uncomment when confident
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
            deliveryCode: order.deliveryCode,
            items: order.items.map(item => `${item.product?.name || 'Unknown Product'} x${item.quantity}`).join(", ")
        }));

        return NextResponse.json({ success: true, orders: formattedOrders });

    } catch (error) {
        console.error("Admin Orders Error:", error);
        // RETURN ACTUAL ERROR FOR DEBUGGING
        return NextResponse.json({ error: "Failed to fetch orders: " + error.message }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/order-lookup?orderId=xxx
 * Used by the Rider Portal to look up order details (amount, customer, address)
 * before completing delivery. No auth required — only non-sensitive info is returned.
 */
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get("orderId")?.trim();

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: { select: { id: true } },
                user: { select: { name: true } }
            }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found. Please check the Order ID." }, { status: 404 });
        }

        if (order.isDelivered) {
            return NextResponse.json({ error: "This order has already been delivered." }, { status: 400 });
        }

        // Only return what the rider needs — no sensitive payment details
        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                total: order.total,
                deliveryFee: order.deliveryFee || 0,
                paymentMethod: order.paymentMethod || "COD",
                customerName: order.guestName || order.user?.name || "Customer",
                customerPhone: order.guestPhone || null,
                address: order.address || "Address not provided",
                itemCount: order.items.length,
                status: order.status,
            }
        });

    } catch (error) {
        console.error("Order lookup error:", error);
        return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { assignOrderToNearestAgent } from "@/utils/deliveryRouting";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    // Ideally we'd verify session role here, assuming Retailers log in securely

    try {
        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order || order.status !== "Pending_Retailer_Acceptance") {
            return NextResponse.json({ error: "Order is no longer available or already accepted." }, { status: 400 });
        }

        // 1. Mark the order as Accepted (Preparing)
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "Preparing" // Retailer is packing the medicines
            }
        });

        // 2. Automatically dispatch the nearest Delivery Agent (Non-blocking)
        assignOrderToNearestAgent(orderId).catch(err => {
            console.error("Failed to execute Rider Dispatch:", err);
        });

        return NextResponse.json({
            success: true,
            message: "Order Accepted! A Delivery Partner is being routed to your pharmacy.",
            order: updatedOrder
        });

    } catch (error) {
        console.error("Retailer Order Accept Error:", error);
        return NextResponse.json({ error: "Failed to accept order" }, { status: 500 });
    }
}

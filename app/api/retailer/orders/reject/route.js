import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { assignOrderToNearestRetailer } from "@/utils/routing"; // Fallback to nearest engine

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "RETAILER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        const retailer = await prisma.retailer.findUnique({
            where: { userId: session.user.id }
        });

        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order || order.status !== "Pending_Retailer_Acceptance" || order.assignedRetailerId !== retailer.id) {
            return NextResponse.json({ error: "Order is no longer available or not assigned to you." }, { status: 400 });
        }

        // 1. Add this Retailer to the declined list so they aren't asked again
        const updatedDeclined = [...(order.declinedRetailers || []), retailer.id];

        // 2. Unassign the current retailer
        const bypassedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                assignedRetailerId: null,
                declinedRetailers: updatedDeclined
            }
        });

        // 3. Immediately trigger the routing engine again to find the NEXT nearest retailer
        assignOrderToNearestRetailer(orderId).catch(err => {
            console.error("Manual Bypass Re-routing Failed:", err);
        });

        return NextResponse.json({
            success: true,
            message: "Order Rejected. Bypassed to the next nearest pharmacy.",
            order: bypassedOrder
        });

    } catch (error) {
        console.error("Retailer Order Reject Error:", error);
        return NextResponse.json({ error: "Failed to reject order" }, { status: 500 });
    }
}

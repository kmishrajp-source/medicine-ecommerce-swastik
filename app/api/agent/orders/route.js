import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// Fetch the currently assigned active delivery for this agent
export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "DELIVERY") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const agent = await prisma.deliveryAgent.findUnique({
            where: { userId: session.user.id }
        });

        if (!agent) return NextResponse.json({ error: "Agent profile not found" }, { status: 404 });

        // Deliveries that are out for delivery or just assigned
        const activeDelivery = await prisma.order.findFirst({
            where: {
                deliveryAgentId: agent.id,
                status: { in: ["Agent_Assigned", "Out_For_Delivery"] }
            },
            include: {
                assignedRetailer: true, // Need this for Pickup Address
                user: { select: { name: true, phone: true } } // Need this for Dropoff Address
            }
        });

        return NextResponse.json({ success: true, activeDelivery });
    } catch (error) {
        console.error("Agent Orders Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Complete a delivery and process the ₹50 payout
export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "DELIVERY") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { orderId, newStatus } = await req.json();

        const agent = await prisma.deliveryAgent.findUnique({
            where: { userId: session.user.id }
        });

        if (newStatus === "Picked_Up") {
            const updated = await prisma.order.update({
                where: { id: orderId, deliveryAgentId: agent.id },
                data: { status: "Out_For_Delivery" }
            });
            return NextResponse.json({ success: true, order: updated });
        }

        if (newStatus === "Delivered") {
            // 1. Mark Order as Delivered
            const updated = await prisma.order.update({
                where: { id: orderId, deliveryAgentId: agent.id },
                data: {
                    status: "Delivered",
                    isDelivered: true
                }
            });

            // 2. Add ₹50 to the Agent's Wallet Balance
            await prisma.deliveryAgent.update({
                where: { id: agent.id },
                data: {
                    walletBalance: { increment: 50.0 }
                }
            });

            return NextResponse.json({
                success: true,
                message: "Delivery Completed! ₹50 has been added to your wallet.",
                order: updated
            });
        }

        return NextResponse.json({ error: "Invalid status update" }, { status: 400 });

    } catch (error) {
        console.error("Agent Order Completion Error:", error);
        return NextResponse.json({ error: "Failed to process delivery completion" }, { status: 500 });
    }
}

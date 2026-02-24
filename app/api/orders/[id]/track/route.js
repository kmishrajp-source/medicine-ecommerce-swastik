import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
    const { id } = params;

    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                assignedRetailer: {
                    select: {
                        shopName: true,
                        address: true,
                        phone: true,
                        lat: true,
                        lng: true
                    }
                },
                deliveryAgent: {
                    select: {
                        vehicleNumber: true,
                        phone: true,
                        lat: true,
                        lng: true,
                        user: { select: { name: true } }
                    }
                },
                items: {
                    select: {
                        quantity: true,
                        price: true,
                        product: { select: { name: true, image: true } }
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Prepare the payload for the Tracking App
        const payload = {
            success: true,
            order: {
                id: order.id,
                total: order.total,
                status: order.status,
                paymentMethod: order.paymentMethod,
                isPaid: order.isPaid,
                address: order.address,
                assignedRetailer: order.assignedRetailer,
                deliveryAgent: order.deliveryAgent,
                items: order.items
            },
            // Explicitly map out the agent location if they are assigned
            agentLocation: order.deliveryAgent && order.deliveryAgent.lat ? {
                lat: order.deliveryAgent.lat,
                lng: order.deliveryAgent.lng
            } : null
        };

        return NextResponse.json(payload);
    } catch (error) {
        console.error("Order Tracking Error:", error);
        return NextResponse.json({ error: "Failed to fetch tracking data", details: error.message }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount, items } = await req.json();

        // 1. Generate 4-digit Random Code
        const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();

        // 2. Create Order in Database
        const order = await prisma.order.create({
            data: {
                userId: session.user.id,
                total: amount,
                status: "Processing",
                paymentMethod: "COD",
                deliveryCode: deliveryCode, // Store the secret code
                isPaid: false,
                isDelivered: false,
                items: {
                    create: items.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }
        });

        // 3. Simulate Sending SMS
        console.log(`[SMS MOCK] Sending to User: Your Secure Delivery Code for Order #${order.id} is: ${deliveryCode}`);

        return NextResponse.json({
            success: true,
            orderId: order.id,
            deliveryCode: deliveryCode, // Returning for testing purposes (remove in prod)
            message: "Order placed successfully! Check your SMS for the delivery code."
        });

    } catch (error) {
        console.error("COD Order Error:", error);
        return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
    }
}

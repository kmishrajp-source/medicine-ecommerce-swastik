import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        const { amount, items, guestName, guestEmail, guestPhone, address } = await req.json();

        // 1. Generate 4-digit Random Code
        const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();

        // 2. Prepare Order Data
        const orderData = {
            total: parseFloat(amount),
            status: "Processing",
            paymentMethod: "COD",
            deliveryCode: deliveryCode, // Store the secret code
            isPaid: false,
            isDelivered: false,
            items: {
                create: items.map(item => ({
                    productId: item.id,
                    quantity: parseInt(item.quantity),
                    price: parseFloat(item.price)
                }))
            }
        };

        // 3. Link User or Guest Details
        if (session) {
            orderData.userId = session.user.id;
            // Address might come from profile later, but for now we trust the input if provided
            if (address) orderData.address = address;
        } else {
            // Guest Checkout
            orderData.guestName = guestName;
            orderData.guestEmail = guestEmail;
            orderData.guestPhone = guestPhone;
            orderData.address = address;
        }

        // 4. Create Order in Database
        const order = await prisma.order.create({
            data: orderData
        });

        // 5. Simulate Sending SMS
        const phone = session?.user?.phone || guestPhone || "Unknown";
        console.log(`[SMS MOCK] Sending to ${phone}: Your Secure Delivery Code for Order #${order.id} is: ${deliveryCode}`);

        return NextResponse.json({
            success: true,
            orderId: order.id,
            deliveryCode: deliveryCode, // Returning for testing purposes (remove in prod)
            message: "Order placed successfully! Check your SMS for the delivery code."
        });

    } catch (error) {
        console.error("COD Order Error - Full Details:", JSON.stringify(error, null, 2));
        console.error("COD Order Error - Message:", error.message);
        // Return a more descriptive error if possible
        const errorMessage = error.message || "Unknown Database Error";
        return NextResponse.json({
            error: `Failed: ${errorMessage}`,
            details: error.toString()
        }, { status: 500 });
    }
}

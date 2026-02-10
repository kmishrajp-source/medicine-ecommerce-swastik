import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
    try {
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpaySignature,
            amount,
            items,
            address,
            guestName,
            guestEmail,
            guestPhone
        } = await req.json();

        // 1. Verify Signature
        const signature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
        signature.update(orderCreationId + "|" + razorpayPaymentId);
        const digest = signature.digest("hex");

        if (digest !== razorpaySignature) {
            return NextResponse.json({ error: "Transaction not legit!" }, { status: 400 });
        }

        // 2. Identify User
        let userId = null;
        const session = await getServerSession(authOptions);

        if (session?.user) {
            userId = session.user.id;
        } else {
            // Guest Logic (Try to find existing guest user by email or fallback)
            // Ideally we should create a Guest User here if not exists, similar to COD logic
            // For brevity, we'll try to find a fallback or just store guest details on Order
            const guestUser = await prisma.user.findFirst({ where: { email: guestEmail || 'guest@swastik.com' } });
            if (guestUser) userId = guestUser.id;
        }

        // 3. Create Order
        // Prepare Items
        const orderItems = items.map(item => ({
            productId: String(item.id),
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price)
        }));

        const newOrder = await prisma.order.create({
            data: {
                userId: userId, // Might be null if guest user setup fails, schema allows nullable? userId is String? in schema.
                // Schema: userId String? @relation... so it is nullable.
                // But generally good to attach to someone.
                guestName: guestName || session?.user?.name,
                guestEmail: guestEmail || session?.user?.email,
                guestPhone: guestPhone,
                address: address,
                total: parseFloat(amount),
                status: "Processing",
                paymentMethod: "ONLINE",
                isPaid: true,
                isDelivered: false,
                items: {
                    create: orderItems
                }
            }
        });

        // 4. Send SMS
        const customerPhone = guestPhone || session?.user?.phone || "";
        const adminPhone = "9161364908"; // Hardcoded as requested
        const orderId = newOrder.id.slice(-6).toUpperCase();

        // Customer SMS
        if (customerPhone) {
            await sendSMS(
                customerPhone,
                `Dear Customer, your order from Swastik Medicare has been billed successfully.\n\nInvoice No: SM${orderId}\nAmount: ₹${amount}\nStatus: Confirmed\n\nInvoice sent to your email.\nThank you for trusting Swastik Medicare.`
            );
        }

        // Admin SMS
        await sendSMS(
            adminPhone,
            `New Order Received! ID: #${orderId}, Amt: ₹${amount}, Customer: ${guestName || "Guest"}. Check Admin Dashboard.`
        );

        return NextResponse.json({
            success: true,
            orderId: newOrder.id,
            message: "Payment Verified & Order Placed"
        });

    } catch (error) {
        console.error("Payment Verification Error:", error);
        return NextResponse.json({ error: "Payment verification failed", details: error.message }, { status: 500 });
    }
}

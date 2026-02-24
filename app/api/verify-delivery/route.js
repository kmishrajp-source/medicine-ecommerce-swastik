import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
    try {
        const { orderId, code } = await req.json();

        if (!orderId || !code) {
            return NextResponse.json({ error: "Missing Order ID or Code" }, { status: 400 });
        }

        // 1. Find the Order
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // 2. Verify Code
        if (order.deliveryCode !== code) {
            return NextResponse.json({ error: "Invalid Delivery Code!" }, { status: 400 });
        }

        // 3. Mark as Delivered & Paid
        await prisma.order.update({
            where: { id: orderId },
            data: {
                isPaid: true,
                isDelivered: true,
                status: "Delivered",
                deliveryCode: null // Optional: Clear code after use
            }
        });

        return NextResponse.json({ success: true, message: "Delivery Verified Successfully!" });

    } catch (error) {
        console.error("Delivery Verification Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

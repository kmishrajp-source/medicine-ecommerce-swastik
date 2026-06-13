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
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                isPaid: true,
                isDelivered: true,
                status: "Delivered",
                deliveryCode: null // Clear code after use
            },
            include: { assignedRetailer: true, deliveryAgent: true }
        });

        // 4. Process Delivery Payouts
        const settings = await prisma.systemSettings.findFirst() || { deliveryAgentFee: 50, selfDeliveryBonus: 15 };
        const deliveryFee = updatedOrder.deliveryFee || settings.deliveryAgentFee;
        const selfBonus = settings.selfDeliveryBonus;

        if (updatedOrder.isRetailerDelivering && updatedOrder.assignedRetailer) {
            // Retailer self-delivery payout
            const totalPay = deliveryFee + selfBonus;
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: updatedOrder.assignedRetailer.userId },
                    data: { walletBalance: { increment: totalPay } }
                }),
                prisma.walletTransaction.create({
                    data: {
                        userId: updatedOrder.assignedRetailer.userId,
                        amount: totalPay,
                        type: "CREDIT",
                        description: `Self-Delivery Payout for Order #${orderId.slice(-6).toUpperCase()}`
                    }
                })
            ]);
        } else if (updatedOrder.deliveryAgent) {
            // Platform Rider delivery payout
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: updatedOrder.deliveryAgent.userId },
                    data: { walletBalance: { increment: deliveryFee } }
                }),
                prisma.walletTransaction.create({
                    data: {
                        userId: updatedOrder.deliveryAgent.userId,
                        amount: deliveryFee,
                        type: "CREDIT",
                        description: `Platform Delivery Payout for Order #${orderId.slice(-6).toUpperCase()}`
                    }
                })
            ]);
        }

        return NextResponse.json({ success: true, message: "Delivery Verified Successfully & Payouts Processed!" });

    } catch (error) {
        console.error("Delivery Verification Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

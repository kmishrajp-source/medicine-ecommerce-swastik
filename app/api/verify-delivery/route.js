import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWhatsAppNotification } from "@/lib/whatsapp";

export async function POST(req) {
    try {
        const { orderId, code, riderUserId } = await req.json();

        if (!orderId || !code) {
            return NextResponse.json({ error: "Missing Order ID or Code" }, { status: 400 });
        }

        // 1. Find the Order with delivery agent details
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                deliveryAgent: { select: { id: true, userId: true, phone: true } }
            }
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
                deliveryCode: null
            }
        });

        // 4. COD Cash Management Integration
        let cashAlertTriggered = false;
        const isCOD = (order.paymentMethod || "").toUpperCase() === "COD";

        if (isCOD) {
            // Determine rider user ID
            const targetRiderUserId = riderUserId || order.deliveryAgent?.userId || order.deliveryAgentId;

            if (targetRiderUserId) {
                // Find or auto-provision RiderCashAccount
                let account = await prisma.riderCashAccount.findUnique({
                    where: { riderId: targetRiderUserId }
                });

                if (!account) {
                    account = await prisma.riderCashAccount.create({
                        data: {
                            riderId: targetRiderUserId,
                            cashHeld: 0.0,
                            cashSlab: 5000.0,
                            totalCollected: 0.0,
                            totalDeposited: 0.0
                        }
                    });
                }

                // Update cash account balances
                const newCashHeld = account.cashHeld + order.total;
                const newTotalCollected = account.totalCollected + order.total;

                await prisma.riderCashAccount.update({
                    where: { id: account.id },
                    data: {
                        cashHeld: newCashHeld,
                        totalCollected: newTotalCollected
                    }
                });

                // Create immutable transaction log
                await prisma.cashTransaction.create({
                    data: {
                        accountId: account.id,
                        type: "COLLECTION",
                        amount: order.total,
                        orderId: order.id,
                        note: `COD Collection for Order #${order.id.slice(-6)}`
                    }
                });

                // Check cash slab enforcement limit
                if (newCashHeld > account.cashSlab) {
                    cashAlertTriggered = true;
                    const phone = order.deliveryAgent?.phone;

                    if (phone) {
                        try {
                            await sendWhatsAppNotification(
                                phone,
                                `🚨 CASH HOLDING LIMIT EXCEEDED\n\nHello Rider, your current cash held is ₹${newCashHeld.toLocaleString()}, which exceeds your assigned limit of ₹${account.cashSlab.toLocaleString()}.\n\nPlease deposit the excess cash into the company bank account immediately to clear your slab.`
                            );
                        } catch (err) {
                            console.warn("Rider over-limit WhatsApp alert error:", err.message);
                        }
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: "Delivery Verified Successfully!",
            isCOD,
            cashAlertTriggered
        });

    } catch (error) {
        console.error("Delivery Verification Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

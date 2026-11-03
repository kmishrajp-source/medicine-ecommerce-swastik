import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { restoreStockOnCancellation } from "@/lib/stock-alerts";
import { sendSMS } from "@/lib/sms";
import { WhatsAppTriggers } from "@/lib/whatsapp";
import { logFailure } from "@/lib/logger";

const ADMIN_PHONE = process.env.ADMIN_PHONE || "917992122974";

const NON_CANCELLABLE_STATUSES = ["Out_for_Delivery", "Delivered"];

export async function POST(req, { params }) {
    try {
        const { id: orderId } = await params;
        if (!orderId) {
            return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        const body = await req.json().catch(() => ({}));
        const { reason = "Customer requested cancellation", guestPhone } = body;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: { product: true }
                },
                user: true
            }
        });

        if (!order) {
            return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
        }

        // Authorization check
        const isOwner = session?.user?.id && order.userId === session.user.id;
        const isAdmin = session?.user?.role === "ADMIN";
        const isGuestAuthorized = guestPhone && order.guestPhone && (guestPhone.slice(-10) === order.guestPhone.slice(-10));

        if (!isOwner && !isAdmin && !isGuestAuthorized) {
            return NextResponse.json({ success: false, error: "Unauthorized to cancel this order" }, { status: 403 });
        }

        // Idempotency: already cancelled
        if (order.status === "Cancelled" || order.status === "ORDER_CANCELLED") {
            return NextResponse.json({
                success: true,
                message: "Order is already cancelled",
                order: { id: order.id, status: order.status }
            });
        }

        // Status check
        if (NON_CANCELLABLE_STATUSES.includes(order.status)) {
            return NextResponse.json({
                success: false,
                error: `Cannot cancel order at stage '${order.status}'. Please contact customer support for returns.`
            }, { status: 400 });
        }

        const shortId = order.id.slice(-6).toUpperCase();
        let refundProcessed = false;
        let refundAmount = 0;

        // Perform cancellation and wallet refund atomically if paid online
        const updatedOrder = await prisma.$transaction(async (tx) => {
            const cancelled = await tx.order.update({
                where: { id: order.id },
                data: {
                    status: "Cancelled",
                    isDelivered: false
                }
            });

            // If order was paid online, credit refund to user wallet
            if (order.isPaid && order.total > 0) {
                refundAmount = order.total;
                refundProcessed = true;

                if (order.userId) {
                    await tx.user.update({
                        where: { id: order.userId },
                        data: {
                            walletBalance: { increment: refundAmount },
                            transactions: {
                                create: {
                                    amount: refundAmount,
                                    type: "CREDIT",
                                    description: `Refund for Cancelled Order #SM${shortId}`
                                }
                            }
                        }
                    });
                }
            }

            return cancelled;
        });

        // Restore deducted inventory back to stock (non-blocking)
        if (order.items && order.items.length > 0) {
            restoreStockOnCancellation(order.items, order.id).catch(err => {
                console.error("[CANCELLATION STOCK RESTORE ERROR]", err.message);
            });
        }

        // Customer & Admin Notifications
        const customerPhone = order.guestPhone || order.user?.phone || session?.user?.phone;
        const refundNote = refundProcessed ? ` A refund of ₹${refundAmount.toFixed(2)} has been credited to your Swastik wallet.` : "";

        if (customerPhone) {
            sendSMS(
                customerPhone,
                `Swastik Medicare: Your order #SM${shortId} has been cancelled successfully.${refundNote}`
            ).catch(() => {});

            WhatsAppTriggers.orderCancelled?.(customerPhone, order.id, refundAmount).catch(() => {});
        }

        sendSMS(
            ADMIN_PHONE,
            `Swastik Medicare Alert: Order #SM${shortId} was CANCELLED. Reason: ${reason}. Amt: ₹${order.total}.`
        ).catch(() => {});

        return NextResponse.json({
            success: true,
            message: `Order #SM${shortId} has been cancelled successfully.${refundNote}`,
            refundProcessed,
            refundAmount,
            order: {
                id: updatedOrder.id,
                status: updatedOrder.status,
                total: updatedOrder.total
            }
        });

    } catch (error) {
        console.error("Order Cancellation Error:", error);
        await logFailure({
            actionType: "order_cancellation",
            errorType: "server",
            errorMessage: error.message,
            pageUrl: "/api/orders/[id]/cancel"
        }).catch(() => {});

        return NextResponse.json({ success: false, error: "Failed to cancel order: " + error.message }, { status: 500 });
    }
}


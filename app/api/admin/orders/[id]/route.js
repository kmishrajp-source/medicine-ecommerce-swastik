import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { WhatsAppTriggers } from "@/lib/whatsapp";

const VALID_STATUSES = [
    "Received",
    "Rx_Uploaded",
    "Pharmacist_Approved",
    "Ready_for_Packing",
    "Out_for_Delivery",
    "Delivered",
    "Cancelled",
    "Refund_Pending",
    "Refunded"
];

// PATCH /api/admin/orders/[id] — Update order status, assign rider, or cancel/refund
export async function PATCH(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { action, status, riderId, refundReason, refundAmount } = body;

        if (!id) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id },
            include: { user: { select: { name: true } } }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // ── ACTION: Update Status ──────────────────────────────────────
        if (action === "update_status" || status) {
            const newStatus = status;
            if (!VALID_STATUSES.includes(newStatus)) {
                return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
            }

            const updated = await prisma.order.update({
                where: { id },
                data: { status: newStatus }
            });

            // Notify customer via WhatsApp if delivered
            if (newStatus === "Delivered" && (order.guestPhone || order.user)) {
                const phone = order.guestPhone;
                if (phone) {
                    try {
                        await WhatsAppTriggers.deliveryOut(phone, id.slice(-8), "Swastik Medicare", "7992122974");
                    } catch (e) { /* non-critical */ }
                }
            }

            return NextResponse.json({ success: true, message: `Order status updated to ${newStatus}`, order: updated });
        }

        // ── ACTION: Assign Rider ───────────────────────────────────────
        if (action === "assign_rider") {
            if (!riderId) {
                return NextResponse.json({ error: "riderId is required for assign_rider action" }, { status: 400 });
            }

            const rider = await prisma.deliveryAgent.findUnique({ where: { id: riderId } });
            if (!rider) {
                return NextResponse.json({ error: "Rider not found" }, { status: 404 });
            }

            // Create or update delivery job
            const existingJob = await prisma.deliveryJob.findFirst({ where: { orderId: id } });

            let job;
            if (existingJob) {
                job = await prisma.deliveryJob.update({
                    where: { id: existingJob.id },
                    data: { agentId: riderId, status: "ASSIGNED" }
                });
            } else {
                job = await prisma.deliveryJob.create({
                    data: {
                        orderId: id,
                        agentId: riderId,
                        status: "ASSIGNED",
                        pickupAddress: "Swastik Medicare Warehouse, Gorakhpur",
                        deliveryAddress: order.address || "Customer Address",
                        distanceKm: 5.0
                    }
                });
            }

            // Update order status
            await prisma.order.update({
                where: { id },
                data: { status: "Out_for_Delivery" }
            });

            // Notify rider
            try {
                await WhatsAppTriggers.simultaneousDispatchAlert(
                    rider.phone,
                    id.slice(-8),
                    "Warehouse",
                    "Swastik Medicare",
                    "Gorakhpur Warehouse",
                    order.address || "Customer Address",
                    order.total
                );
            } catch (e) { /* non-critical */ }

            return NextResponse.json({ success: true, message: `Rider assigned. Delivery job created.`, job });
        }

        // ── ACTION: Cancel Order ───────────────────────────────────────
        if (action === "cancel") {
            if (["Delivered", "Cancelled", "Refunded"].includes(order.status)) {
                return NextResponse.json({
                    error: `Cannot cancel an order with status: ${order.status}`
                }, { status: 400 });
            }

            const updated = await prisma.order.update({
                where: { id },
                data: { status: "Cancelled" }
            });

            // Restore stock for each item
            const items = await prisma.orderItem.findMany({ where: { orderId: id } });
            for (const item of items) {
                if (item.productId) {
                    await prisma.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } }
                    });
                }
            }

            return NextResponse.json({ success: true, message: "Order cancelled. Stock restored.", order: updated });
        }

        // ── ACTION: Initiate Refund ────────────────────────────────────
        if (action === "refund") {
            if (!["Delivered", "Cancelled"].includes(order.status)) {
                return NextResponse.json({
                    error: "Refunds can only be initiated for Delivered or Cancelled orders."
                }, { status: 400 });
            }

            const amount = parseFloat(refundAmount) || order.total;
            const reason = refundReason || "Admin initiated refund";

            const updated = await prisma.order.update({
                where: { id },
                data: { status: "Refund_Pending" }
            });

            // Create an audit log for the refund
            try {
                await prisma.systemHealthLog.create({
                    data: {
                        component: "OrderRefund",
                        issueType: "REFUND_INITIATED",
                        severity: "INFO",
                        message: `Refund initiated for Order ${id.slice(-8)} by Admin ${session.user.email}`,
                        details: { orderId: id, amount, reason, initiatedBy: session.user.email }
                    }
                });
            } catch (e) { /* non-critical */ }

            return NextResponse.json({
                success: true,
                message: `Refund of ₹${amount} initiated for Order ${id.slice(-8)}. Status: Refund_Pending. Process the transfer manually and mark as Refunded.`,
                order: updated,
                refundDetails: { amount, reason }
            });
        }

        // ── ACTION: Mark Refunded ──────────────────────────────────────
        if (action === "mark_refunded") {
            const updated = await prisma.order.update({
                where: { id },
                data: { status: "Refunded" }
            });

            // Notify customer
            const phone = order.guestPhone;
            if (phone) {
                try {
                    await WhatsAppTriggers.paymentSuccess(phone, order.total, "Refund");
                } catch (e) { /* non-critical */ }
            }

            return NextResponse.json({ success: true, message: "Order marked as Refunded. Customer notified.", order: updated });
        }

        return NextResponse.json({ error: "Invalid action. Use: update_status, assign_rider, cancel, refund, mark_refunded" }, { status: 400 });

    } catch (error) {
        console.error("[ADMIN ORDER PATCH]", error);
        return NextResponse.json({ error: "Internal server error: " + error.message }, { status: 500 });
    }
}

// GET /api/admin/orders/[id] — Fetch single order detail
export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, email: true } },
                items: { include: { product: { select: { name: true, buyingPrice: true } } } },
                deliveryJobs: { include: { agent: { select: { name: true, phone: true } } } }
            }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, order });
    } catch (error) {
        console.error("[ADMIN ORDER GET]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

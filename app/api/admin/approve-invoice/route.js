import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { learnPriceFromInvoice } from "@/utils/invoice-service";
import { WhatsAppTriggers } from "@/lib/whatsapp";
import { triggerWebhook } from "@/lib/webhooks";

/**
 * Admin API to approve or reject draft invoices.
 * Supports manual price adjustments and status updates.
 */
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { invoiceId, status, adjustedAmount, adminRemarks } = await req.json();

        // 1. Update the Draft Invoice
        const updatedInvoice = await prisma.draftInvoice.update({
            where: { id: invoiceId },
            data: {
                status: status, // APPROVED or REJECTED
                amount: adjustedAmount || undefined,
                adminRemarks: adminRemarks
            },
            include: { subOrder: { include: { order: true, user: true } } }
        });

        // 2. If approved, learn the prices and update sub-order status
        if (status === "APPROVED") {
            await learnPriceFromInvoice(invoiceId);

            await prisma.subOrder.update({
                where: { id: updatedInvoice.subOrderId },
                data: { status: "Approved" }
            });

            // Notify Customer via WhatsApp
            const phone = updatedInvoice.subOrder.order.guestPhone || updatedInvoice.subOrder.user?.phone;
            if (phone) {
                await WhatsAppTriggers.invoiceApproved(phone, updatedInvoice.subOrder.orderId);
            }

            // Fire Webhook
            triggerWebhook("order_confirmed", updatedInvoice.subOrder.orderId);
        }

        // 3. Log the action
        await prisma.adminApprovalLog.create({
            data: {
                adminId: session.user.id,
                actionType: "INVOICE_APPROVAL",
                targetId: invoiceId,
                details: `Status: ${status}, Amount: ${adjustedAmount}`
            }
        });

        return NextResponse.json({ success: true, invoice: updatedInvoice });

    } catch (error) {
        console.error("[ADMIN API ERROR] Invoice Approval:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

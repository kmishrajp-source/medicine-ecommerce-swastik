import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendSMS } from "@/lib/sms";
import { assignOrderToNearestRetailer } from "@/utils/routing";
import { splitOrderIntoSubOrders } from "@/utils/marketplace";
import { WhatsAppTriggers } from "@/lib/whatsapp";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prescriptionId, items, total, patientId } = await req.json();

    try {
        // 1. Create the Order
        const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit code

        const order = await prisma.order.create({
            data: {
                userId: patientId,
                total: parseFloat(total),
                status: 'Processing', // Immediately route to retailers
                paymentMethod: 'ONLINE', // Default, waiting for payment
                deliveryCode,
                items: {
                    create: items.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }
        });

        // 2. Update Prescription Status
        await prisma.prescription.update({
            where: { id: prescriptionId },
            data: { status: 'Processed', orderId: order.id }
        });

        // 3. Marketplace Logic
        assignOrderToNearestRetailer(order.id).catch(e => console.error("Prescription Routing Exception:", e));
        splitOrderIntoSubOrders(order.id).catch(e => console.error("Marketplace Split Exception:", e));

        // 4. Notifications
        const patient = await prisma.user.findUnique({ where: { id: patientId } });
        if (patient && patient.phone) {
            const shortId = order.id.slice(-6).toUpperCase();
            // Legacy SMS
            await sendSMS(
                patient.phone,
                `Dear ${patient.name || 'Customer'}, your prescription-based order #SM${shortId} is ready. Total: ₹${total}. Please login to pay and track delivery. Your Secret Code: ${deliveryCode}`
            );
            // New WhatsApp
            WhatsAppTriggers.orderConfirmed(patient.phone, order.id, total, deliveryCode);
        }

        console.log(`[MARKETPLACE] Prescription Order ${order.id} processed and routed.`);

        return NextResponse.json({ success: true, orderId: order.id, deliveryCode });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

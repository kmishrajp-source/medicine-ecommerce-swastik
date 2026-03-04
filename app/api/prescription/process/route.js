import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendSMS } from "@/lib/sms";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
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
                status: 'Pending Payment',
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

        // 3. Send SMS to Customer
        // In this implementation, we need the customer's phone number. 
        // We can fetch it from the patientId or it might be passed in.
        const patient = await prisma.user.findUnique({ where: { id: patientId } });
        if (patient && patient.phone) {
            const shortId = order.id.slice(-6).toUpperCase();
            await sendSMS(
                patient.phone,
                `Dear ${patient.name || 'Customer'}, your prescription-based order #SM${shortId} is ready. Total: ₹${total}. Please login to pay and track delivery. Your Secret Code: ${deliveryCode}`
            );
        }

        console.log(`[SMS] To Patient: Order ${order.id} created from prescription. Code: ${deliveryCode}`);

        return NextResponse.json({ success: true, orderId: order.id, deliveryCode });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

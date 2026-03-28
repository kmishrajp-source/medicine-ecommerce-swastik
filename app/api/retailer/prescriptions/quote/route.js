import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendSMS } from "@/lib/sms";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'RETAILER') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prescriptionId, items, total, patientId } = await req.json();

    try {
        // Find the retailer
        const retailer = await prisma.retailer.findUnique({
            where: { userId: session.user.id }
        });

        if (!retailer) {
            return NextResponse.json({ error: "Retailer profile not found" }, { status: 404 });
        }

        // 1. Create the Order directly assigned to this retailer
        const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString(); 

        const order = await prisma.order.create({
            data: {
                userId: patientId,
                assignedRetailerId: retailer.id,
                total: parseFloat(total),
                status: 'Pending Payment',
                paymentMethod: 'ONLINE',
                deliveryCode,
                items: {
                    create: items.map(item => ({
                        productId: item.id,
                        quantity: parseInt(item.quantity),
                        price: parseFloat(item.price)
                    }))
                }
            }
        });

        // 2. Update Prescription Status
        await prisma.prescription.update({
            where: { id: prescriptionId },
            data: { 
                status: 'Processed', 
                orderId: order.id 
            }
        });

        // 3. Notify Customer
        const patient = await prisma.user.findUnique({ where: { id: patientId } });
        if (patient && patient.phone) {
            const shortId = order.id.slice(-6).toUpperCase();
            await sendSMS(
                patient.phone,
                `Swastik Medicare: Your prescription has been quoted by ${retailer.shopName}. Total: ₹${total}. Please login to pay and track order #SM${shortId}. Code: ${deliveryCode}`
            );
        }

        return NextResponse.json({ success: true, orderId: order.id });
    } catch (error) {
        console.error("Retailer Quote Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}


import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendSMS } from "@/lib/sms";
import { logFailure } from "@/lib/logger";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrl } = await req.json();

    try {
        await prisma.prescription.create({
            data: {
                imageUrl,
                patientId: session.user.id,
                status: 'Pending'
            }
        });

        // Notify Admin Setup
        const adminPhone = "9161364908";
        await sendSMS(
            adminPhone,
            `Swastik Medicare: New Prescription Uploaded by ${session.user.name || 'Customer'}. Please review in Admin Dashboard.`
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        await logFailure({
            userId: session?.user?.id,
            userRole: session?.user?.role || 'CUSTOMER',
            actionType: 'upload',
            errorType: 'server',
            errorMessage: error.message,
            pageUrl: '/upload-prescription'
        });
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const prescriptions = await prisma.prescription.findMany({
            where: { status: 'Pending', orderId: null }, // Standalone uploads
            include: { patient: true },
            orderBy: { createdAt: 'desc' }
        });

        const ordersAwaitingRx = await prisma.order.findMany({
            where: { status: 'Rx_Uploaded' },
            include: {
                user: true,
                prescription: true,
                items: { include: { product: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, prescriptions, ordersAwaitingRx });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

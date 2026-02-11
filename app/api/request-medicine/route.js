import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    const { name, quantity, phone, guestName, prescriptionUrl } = await req.json();

    try {
        await prisma.medicineRequest.create({
            data: {
                medicineName: name,
                quantity,
                prescriptionUrl,
                userId: session?.user?.id || null,
                guestName: session ? null : guestName,
                guestPhone: session ? null : phone,
                status: 'Pending'
            }
        });
        return NextResponse.json({ success: true, message: "Request submitted successfully!" });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const requests = await prisma.medicineRequest.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        });
        return NextResponse.json({ success: true, requests });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

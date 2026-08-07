import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const appointments = await prisma.appointment.findMany({
            orderBy: { createdAt: "desc" },
            take: 200,
            include: {
                patient: { select: { name: true, phone: true, email: true } },
                doctor: { select: { name: true, phone: true, specialization: true, isDirectory: true, hospital: true } }
            }
        });

        return NextResponse.json({ success: true, appointments });

    } catch (error) {
        console.error("Fetch Appointments API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, status } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ error: "Missing ID or status" }, { status: 400 });
        }

        const updated = await prisma.appointment.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json({ success: true, appointment: updated });

    } catch (error) {
        console.error("Update Appointment Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

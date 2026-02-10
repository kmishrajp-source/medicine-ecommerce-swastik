import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    try {
        const { doctorId, date, reason } = await req.json();

        const appointment = await prisma.appointment.create({
            data: {
                patientId: session.user.id,
                doctorId,
                date: new Date(date),
                reason
            }
        });

        return NextResponse.json({ success: true, appointment });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

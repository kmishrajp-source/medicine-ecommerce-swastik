import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        let appointments = [];
        if (session.user.role === 'DOCTOR') {
            // Find doctor profile first
            const doctor = await prisma.doctor.findUnique({ where: { userId: session.user.id } });
            if (doctor) {
                appointments = await prisma.appointment.findMany({
                    where: { doctorId: doctor.id },
                    include: { patient: true },
                    orderBy: { date: 'asc' }
                });
            }
        } else {
            // Patient
            appointments = await prisma.appointment.findMany({
                where: { patientId: session.user.id },
                include: { doctor: { include: { user: true } } },
                orderBy: { date: 'asc' }
            });
        }

        return NextResponse.json({ success: true, appointments });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

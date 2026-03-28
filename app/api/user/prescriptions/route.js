import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const prescriptions = await prisma.prescription.findMany({
            where: { patientId: session.user.id },
            include: {
                doctor: { include: { user: { select: { name: true } } } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, prescriptions });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

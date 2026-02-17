import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    try {
        const { testId } = await req.json();

        const booking = await prisma.labBooking.create({
            data: {
                patientId: session.user.id,
                testId,
                status: "Pending"
            }
        });

        return NextResponse.json({ success: true, booking });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

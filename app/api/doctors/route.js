import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const doctors = await prisma.doctor.findMany({
            where: { verified: true },
            include: { user: { select: { name: true, email: true } } }
        });
        return NextResponse.json({ success: true, doctors });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

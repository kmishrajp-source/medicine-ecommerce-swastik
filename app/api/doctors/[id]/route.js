import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
    try {
        const { id } = params;
        const doctor = await prisma.doctor.findUnique({
            where: { id },
            include: { user: { select: { name: true, email: true } } }
        });
        if (!doctor) return NextResponse.json({ success: false, error: "Doctor not found" }, { status: 404 });
        return NextResponse.json({ success: true, doctor });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

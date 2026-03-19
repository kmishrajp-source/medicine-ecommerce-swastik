import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const doctors = await prisma.doctor.findMany({
            where: { verified: true },
            include: { user: { select: { name: true, email: true } } }
        });
        
        // Ensure name consistency for UI
        const mappedDoctors = doctors.map(d => ({
            ...d,
            name: d.name || d.user?.name || "Unknown Doctor",
            email: d.user?.email || null
        }));

        return NextResponse.json({ success: true, doctors: mappedDoctors });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

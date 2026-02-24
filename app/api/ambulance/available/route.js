import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');

    try {
        const ambulances = await prisma.ambulance.findMany({
            where: {
                city: { contains: city || '', mode: 'insensitive' },
                isAvailable: true
            }
        });
        return NextResponse.json({ success: true, ambulances });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

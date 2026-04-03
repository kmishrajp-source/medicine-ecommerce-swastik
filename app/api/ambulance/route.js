import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const city = searchParams.get('city') || 'Gorakhpur';

        const ambulances = await prisma.ambulance.findMany({
            where: { 
                isDirectory: true,
                city: { contains: city, mode: 'insensitive' }
            },
            orderBy: { driverName: 'asc' }
        });

        return NextResponse.json({ success: true, ambulances });
    } catch (error) {
        console.error("Ambulance API Error:", error);
        return NextResponse.json({ success: false, error: 'Failed to fetch ambulance services' }, { status: 500 });
    }
}

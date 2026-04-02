import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const city = searchParams.get('city') || 'Gorakhpur';

        const retailers = await prisma.retailer.findMany({
            where: { 
                city: { contains: city, mode: 'insensitive' }
            },
            orderBy: { shopName: 'asc' }
        });

        return NextResponse.json({ success: true, retailers });
    } catch (error) {
        console.error("Retailer API Error:", error);
        return NextResponse.json({ success: false, error: 'Failed to fetch retailers' }, { status: 500 });
    }
}

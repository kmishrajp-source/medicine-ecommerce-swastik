import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const city = searchParams.get('city') || 'Gorakhpur';

        const retailers = await prisma.retailer.findMany({
            where: { city },
            orderBy: { shopName: 'asc' }
        });

        const formattedRetailers = retailers.map(r => ({
            ...r,
            verified: r.status === 'verified' || r.verified
        }));

        return NextResponse.json({ success: true, retailers: formattedRetailers });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

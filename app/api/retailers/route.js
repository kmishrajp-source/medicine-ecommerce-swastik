import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from 'fs';
import path from 'path';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const city = searchParams.get('city') || 'Gorakhpur';

        let retailers = await prisma.retailer.findMany({
            where: { 
                city: { contains: city, mode: 'insensitive' }
            },
            orderBy: { shopName: 'asc' }
        });

        // Fallback to local JSON if DB is empty
        if (retailers.length === 0) {
            const filePath = path.join(process.cwd(), 'data', 'gorakhpur-healthcare.json');
            if (fs.existsSync(filePath)) {
                const fileData = fs.readFileSync(filePath, 'utf-8');
                const data = JSON.parse(fileData);
                
                const fallbackRetailers = data.filter(item => item.type === 'retailer').map(r => ({
                    id: r.id,
                    shopName: r.name,
                    address: r.address,
                    phone: r.phone,
                    city: 'Gorakhpur',
                    locality: r.locality,
                    rating: r.rating,
                    ratingCount: r.reviews,
                    verified: r.verified,
                    openingHours: r.openingHours || "9:00 AM - 10:00 PM",
                    photoUrl: r.photoUrl || null
                }));
                
                retailers = fallbackRetailers;
            }
        }

        return NextResponse.json({ success: true, retailers });
    } catch (error) {
        console.error("Retailer API Error:", error);
        return NextResponse.json({ success: false, error: 'Failed to fetch retailers' }, { status: 500 });
    }
}

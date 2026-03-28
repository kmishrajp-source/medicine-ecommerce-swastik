import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        const doctors = await prisma.doctor.findMany({
            where: { city: "Gorakhpur", isDirectory: true },
            select: { consultationFee: true, rating: true }
        });

        if (doctors.length === 0) {
            return NextResponse.json({
                success: true,
                stats: { min: 200, avg: 450, max: 1000, count: 0 }
            });
        }

        const fees = doctors.map(d => d.consultationFee);
        const min = Math.min(...fees);
        const max = Math.max(...fees);
        const avg = Math.round(fees.reduce((a, b) => a + b, 0) / fees.length);

        return NextResponse.json({
            success: true,
            stats: {
                min,
                avg: avg || 450,
                max,
                count: doctors.length
            }
        });
    } catch (error) {
        console.error("Stats API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

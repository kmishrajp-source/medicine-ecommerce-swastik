import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const tests = await prisma.labTest.findMany({
            include: { lab: { select: { name: true, address: true, verified: true } } },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ success: true, tests });
    } catch (error) {
        console.error("Failed to fetch lab tests:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

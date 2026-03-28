import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const hospitals = await prisma.hospital.findMany({ include: { user: true } });
        const insurance = await prisma.insuranceProvider.findMany({ include: { user: true } });
        const manufacturers = await prisma.manufacturer.findMany({ include: { user: true } });

        return NextResponse.json({
            success: true,
            hospitals,
            insurance,
            manufacturers
        });

    } catch (error) {
        console.error("Admin Partner API Error:", error);
        return NextResponse.json({ error: "Failed to fetch partners" }, { status: 500 });
    }
}

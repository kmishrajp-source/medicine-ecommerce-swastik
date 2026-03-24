import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sanitizeProfile } from "@/lib/security";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        const isAuthenticated = !!session;

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const pincode = searchParams.get('pincode');
        
        const where = {
            OR: [
                { verified: true },
                { isDirectory: true }
            ]
        };
        
        if (status) {
            where.status = status;
        }

        if (pincode) {
            where.OR = [
                { location: { contains: pincode } },
                { hospital: { contains: pincode } }
            ];
        }

        const doctors = await prisma.doctor.findMany({
            where: where,
            include: { user: { select: { name: true, email: true, phone: true } } },
            orderBy: { createdAt: 'desc' }
        });
        
        const formattedDoctors = doctors.map(d => {
            const baseData = {
                ...d,
                name: d.name || d.user?.name || "Doctor",
                email: d.email || d.user?.email || null,
                phone: d.phone || d.user?.phone || null,
                verified: d.status === 'verified' || d.verified
            };
            return sanitizeProfile(baseData, isAuthenticated);
        });

        return NextResponse.json({ success: true, doctors: formattedDoctors });
    } catch (error) {
        console.error("Doctors API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

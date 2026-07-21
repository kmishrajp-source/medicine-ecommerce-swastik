import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sanitizeProfile } from "@/lib/security";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        const isAuthenticated = !!session;

        const { searchParams } = new URL(req.url);
        const city = searchParams.get('city');
        const specialty = searchParams.get('specialty');
        const q = searchParams.get('q');
        const all = searchParams.get('all') === 'true';

        const where = {};
        if (city && !all) {
            where.city = { equals: city, mode: 'insensitive' };
        }
        if (specialty) {
            where.specialties = { contains: specialty, mode: 'insensitive' };
        }
        if (q) {
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { city: { contains: q, mode: 'insensitive' } },
                { specialties: { contains: q, mode: 'insensitive' } },
                { address: { contains: q, mode: 'insensitive' } },
                { phone: { contains: q, mode: 'insensitive' } }
            ];
        }

        const hospitals = await prisma.hospital.findMany({
            where,
            include: { doctors: true },
            orderBy: { name: 'asc' }
        });

        const formattedHospitals = hospitals.map(h => sanitizeProfile(h, isAuthenticated));

        return NextResponse.json({ success: true, hospitals: formattedHospitals });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Access Denied: Admins Only" }, { status: 403 });
        }

        const data = await req.json();
        const hospital = await prisma.hospital.create({ data });
        return NextResponse.json({ success: true, hospital });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}


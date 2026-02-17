import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const [doctors, labs, ambulances, pharmas, mrs] = await Promise.all([
            prisma.doctor.findMany({ where: { verified: false }, include: { user: true } }),
            prisma.lab.findMany({ where: { verified: false }, include: { user: true } }),
            prisma.ambulance.findMany({ where: { isAvailable: true }, take: 10 }), // Ambulance doesn't have verified field in first schema, assuming verify via availability or add field. Actually let's assume all need check.
            prisma.pharmaCompany.findMany({ where: { verified: false }, include: { user: true } }),
            prisma.medicalRep.findMany({ where: { verified: false }, include: { user: true } })
        ]);

        return NextResponse.json({
            success: true,
            pending: { doctors, labs, ambulances, pharmas, mrs }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, id, action } = await req.json(); // action: 'approve' or 'reject'
    const verified = action === 'approve';

    try {
        if (type === 'doctor') await prisma.doctor.update({ where: { id }, data: { verified } });
        else if (type === 'lab') await prisma.lab.update({ where: { id }, data: { verified } });
        else if (type === 'pharma') await prisma.pharmaCompany.update({ where: { id }, data: { verified } });
        else if (type === 'mr') await prisma.medicalRep.update({ where: { id }, data: { verified, status: verified ? 'Active' : 'Rejected' } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

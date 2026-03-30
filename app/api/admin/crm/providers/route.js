import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        
        // Ensure Admin role
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // Fetch providers in parallel
        const [doctors, hospitals, labs, retailers] = await Promise.all([
            prisma.doctor.findMany({ select: { id: true, doctorName: true, phone: true, specialization: true, locality: true, verified: true } }),
            prisma.hospital.findMany({ select: { id: true, name: true, phone: true, specialties: true, address: true, verified: true } }),
            prisma.lab.findMany({ select: { id: true, name: true, phone: true, services: true, address: true, verified: true } }),
            prisma.retailer.findMany({ select: { id: true, shopName: true, phone: true, address: true, verified: true } })
        ]);

        // Aggregate and map them into a uniform array
        const providers = [
            ...doctors.map(d => ({ ...d, type: 'doctor', name: d.doctorName })),
            ...hospitals.map(h => ({ ...h, type: 'hospital' })),
            ...labs.map(l => ({ ...l, type: 'lab' })),
            ...retailers.map(r => ({ ...r, type: 'retailer', name: r.shopName }))
        ];

        return NextResponse.json({ success: true, providers });

    } catch (error) {
        console.error("Fetch Providers Error:", error);
        return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
    try {
        const { type, name, phone, address, lat, lng, photoUrl, specialization, shopName } = await req.json();
        
        if (type === 'doctor') {
            const doctor = await prisma.doctor.create({
                data: {
                    name,
                    phone,
                    specialization: specialization || "General Physician",
                    status: 'verified', // Field agent adds verified entries directly or we can set to unverified
                    source: 'field_agent',
                    lat,
                    lng,
                    photoUrl,
                    verified: true
                }
            });
            return NextResponse.json({ success: true, data: doctor });
        } else if (type === 'retailer') {
            const retailer = await prisma.retailer.create({
                data: {
                    shopName,
                    phone,
                    address,
                    status: 'verified',
                    source: 'field_agent',
                    lat,
                    lng,
                    photoUrl,
                    verified: true,
                    licenseNumber: "FIELD-COLLECTED"
                }
            });
            return NextResponse.json({ success: true, data: retailer });
        }
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

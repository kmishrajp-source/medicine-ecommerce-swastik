import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type'); // 'doctor' | 'retailer'
        const status = searchParams.get('status');

        if (type === 'doctor') {
            const doctors = await prisma.doctor.findMany({
                where: status ? { status } : {},
                orderBy: { createdAt: 'desc' }
            });
            return NextResponse.json({ success: true, data: doctors });
        } else if (type === 'retailer') {
            const retailers = await prisma.retailer.findMany({
                where: status ? { status } : {},
                orderBy: { createdAt: 'desc' }
            });
            return NextResponse.json({ success: true, data: retailers });
        }
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const { type, id, status } = await req.json(); // status: 'verified' | 'claimed'
        
        if (type === 'doctor') {
            const updated = await prisma.doctor.update({
                where: { id },
                data: { status, verified: status === 'verified' }
            });
            return NextResponse.json({ success: true, data: updated });
        } else if (type === 'retailer') {
            const updated = await prisma.retailer.update({
                where: { id },
                data: { status, verified: status === 'verified' }
            });
            return NextResponse.json({ success: true, data: updated });
        }
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

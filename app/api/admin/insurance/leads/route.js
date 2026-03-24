import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (id) {
            const lead = await prisma.insuranceLead.findUnique({
                where: { id },
                include: { 
                    plan: { include: { company: true } }, 
                    user: true, 
                    publisher: true 
                }
            });
            return NextResponse.json({ success: true, lead });
        }

        const leads = await prisma.insuranceLead.findMany({
            include: { 
                plan: { include: { company: true } }, 
                user: true, 
                publisher: true 
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, leads });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const { id, leadStatus } = await req.json();

        if (!id || !leadStatus) {
            return NextResponse.json({ error: "ID and Status are required" }, { status: 400 });
        }

        const updatedLead = await prisma.insuranceLead.update({
            where: { id },
            data: { leadStatus }
        });

        return NextResponse.json({ success: true, lead: updatedLead });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

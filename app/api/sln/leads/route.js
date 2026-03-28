import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const leads = await prisma.lead.findMany({
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ success: true, leads });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const { id, status } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ error: "ID and Status are required" }, { status: 400 });
        }

        const updatedLead = await prisma.lead.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json({ success: true, lead: updatedLead });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

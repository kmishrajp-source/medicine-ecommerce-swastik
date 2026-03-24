import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const insuranceLeads = await prisma.insuranceLead.findMany({
            where: { publisherId: session.user.id },
            include: { 
                plan: { include: { company: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const slnLeads = await prisma.lead.findMany({
            where: { publisherId: session.user.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ 
            success: true, 
            insuranceLeads, 
            slnLeads,
            // For backward compatibility if needed
            leads: [...insuranceLeads, ...slnLeads].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

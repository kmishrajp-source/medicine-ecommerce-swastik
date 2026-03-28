import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { publisher: true }
        });

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const publisherId = user.publisher?.id;

        const insuranceLeads = await prisma.insuranceLead.findMany({
            where: { OR: [{ publisherId: session.user.id }, { publisherId: publisherId }] },
            include: { 
                plan: { include: { company: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const slnLeads = await prisma.lead.findMany({
            where: { OR: [{ publisherId: session.user.id }, { publisherId: publisherId }] },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ 
            success: true, 
            walletBalance: user.walletBalance,
            insuranceLeads, 
            slnLeads,
            // For backward compatibility if needed
            leads: [...insuranceLeads, ...slnLeads].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}


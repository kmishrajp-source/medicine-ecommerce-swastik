import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const leads = await prisma.lead.findMany({
            where: {
                assignedAgentId: session.user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Basic stats
        const stats = {
            total: leads.length,
            contacted: leads.filter(l => l.status === 'contacted').length,
            interested: leads.filter(l => l.status === 'interested').length,
            converted: leads.filter(l => l.status === 'converted').length
        };

        return NextResponse.json({ success: true, leads, stats });
    } catch (error) {
        console.error("Fetch Agent Leads Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


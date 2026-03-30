import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const agentId = searchParams.get('agentId');
    const area = searchParams.get('area');
    const serviceType = searchParams.get('serviceType');

    const where = {};
    if (status && status !== 'all') where.status = status;
    if (serviceType && serviceType !== 'all') where.serviceType = serviceType;
    if (agentId && agentId !== 'all') {
        where.assignedAgentId = agentId === 'none' ? null : agentId;
    }
    if (area && area !== 'all') where.area = area;

    try {
        const [leads, agents] = await Promise.all([
            prisma.lead.findMany({
                where,
                include: { assignedAgent: { select: { name: true } } },
                orderBy: { createdAt: 'desc' },
                take: 100 // Pagination placeholder
            }),
            prisma.user.findMany({
                where: { role: 'AGENT' },
                select: { id: true, name: true }
            })
        ]);

        return NextResponse.json({ success: true, leads, agents });
    } catch (error) {
        console.error("Fetch CRM Leads Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


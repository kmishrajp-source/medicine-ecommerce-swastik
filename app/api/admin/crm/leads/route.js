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

    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const skip = (page - 1) * limit;

    const where = {};
    if (status && status !== 'all') where.status = status;
    if (serviceType && serviceType !== 'all') where.serviceType = serviceType;
    if (agentId && agentId !== 'all') {
        where.assignedAgentId = agentId === 'none' ? null : agentId;
    }
    if (area && area !== 'all') where.area = area;

    try {
        const [leads, agents, total] = await Promise.all([
            prisma.lead.findMany({
                where,
                include: { assignedAgent: { select: { name: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.user.findMany({
                where: { role: 'AGENT' },
                select: { id: true, name: true }
            }),
            prisma.lead.count({ where })
        ]);

        return NextResponse.json({ 
            success: true, 
            leads, 
            agents,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Fetch CRM Leads Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


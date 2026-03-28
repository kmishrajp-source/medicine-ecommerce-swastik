import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { leadIds, agentId } = await req.json();

        if (!Array.isArray(leadIds) || leadIds.length === 0 || !agentId) {
            return NextResponse.json({ error: "Lead IDs and Agent ID are required" }, { status: 400 });
        }

        const result = await prisma.lead.updateMany({
            where: {
                id: { in: leadIds }
            },
            data: {
                assignedAgentId: agentId === 'none' ? null : agentId
            }
        });

        return NextResponse.json({ success: true, count: result.count });
    } catch (error) {
        console.error("Assign Leads Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

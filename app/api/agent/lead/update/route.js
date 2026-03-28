import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { leadId, status, notes } = await req.json();

        if (!leadId) {
            return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
        }

        // Verify lead is assigned to this agent
        const lead = await prisma.lead.findUnique({
            where: { id: leadId }
        });

        if (!lead || lead.assignedAgentId !== session.user.id) {
            return NextResponse.json({ error: "Lead not found or not assigned to you" }, { status: 403 });
        }

        const updatedLead = await prisma.lead.update({
            where: { id: leadId },
            data: {
                status,
                notes,
                lastContactDate: new Date()
            }
        });

        // Trigger Automation based on status
        try {
            const { SSMSAutomation } = await import("@/lib/ssms-automation");
            await SSMSAutomation.onStatusChange(leadId, status);
        } catch (autoErr) {
            console.error("SSMS Automation Trigger Failed:", autoErr);
        }

        return NextResponse.json({ success: true, lead: updatedLead });
    } catch (error) {
        console.error("Update Lead Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


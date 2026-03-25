import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { leads } = await req.json(); // Expecting array of lead objects from CSV parser on frontend

        if (!Array.isArray(leads) || leads.length === 0) {
            return NextResponse.json({ error: "No leads provided" }, { status: 400 });
        }

        // Get all active agents for round-robin assignment
        const agents = await prisma.user.findMany({
            where: { role: 'AGENT' },
            select: { id: true }
        });

        if (agents.length === 0) {
            // If no agents, assign to admin or leave unassigned
            console.warn("No agents found for auto-assignment. Leads will remain unassigned.");
        }

        const createdLeads = [];
        let agentIndex = 0;

        for (const leadData of leads) {
            const assignedAgentId = agents.length > 0 ? agents[agentIndex % agents.length].id : null;
            
            const newLead = await prisma.lead.create({
                data: {
                    guestName: leadData.name,
                    guestPhone: leadData.phone,
                    serviceType: leadData.type || 'doctor',
                    area: leadData.area,
                    source: leadData.source || 'bulk_upload',
                    status: 'new',
                    assignedAgentId: assignedAgentId,
                    notes: leadData.notes,
                    planType: leadData.plan || 'basic',
                    amount: leadData.amount ? parseFloat(leadData.amount) : 0,
                    paymentStatus: 'pending'
                }
            });
            
            createdLeads.push(newLead);
            agentIndex++;
            
            // Trigger Automation: Intro WhatsApp (Mock)
            // In a real system, we'd call WhatsAppTriggers here
            // WhatsAppTriggers.leadCreatedCustomer(newLead.guestPhone, newLead.guestName, newLead.serviceType);
        }

        return NextResponse.json({ 
            success: true, 
            count: createdLeads.length,
            message: `Successfully imported ${createdLeads.length} leads and assigned to ${agents.length} agents.`
        });

    } catch (error) {
        console.error("Bulk Import Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { WhatsAppMessageSender } from "@/lib/whatsapp";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { leadIds, templateName, batchName } = await req.json();

        if (!leadIds || leadIds.length === 0 || !templateName) {
            return NextResponse.json({ error: "Leads and template are required" }, { status: 400 });
        }

        // 1. Create Batch Record
        const batch = await prisma.whatsappBatch.create({
            data: {
                name: batchName || `Batch ${new Date().toISOString()}`,
                templateName,
                totalLeads: leadIds.length,
                status: "in_progress"
            }
        });

        // 2. Fetch Lead Details
        const leads = await prisma.lead.findMany({
            where: { id: { in: leadIds } },
            select: { guestName: true, guestPhone: true }
        });

        // 3. Trigger Async Sending (Simplified for Demo)
        // In production, use a queue or background job
        let sent = 0;
        for (const lead of leads) {
            try {
                // Pass batch.id for status reconciliation
                await WhatsAppMessageSender.sendBulkTemplate(lead.guestPhone, templateName, { name: lead.guestName }, batch.id);
                sent++;
            } catch (err) {
                console.error(`Failed to send to ${lead.guestPhone}`, err);
            }
        }

        // 4. Update Batch
        await prisma.whatsappBatch.update({
            where: { id: batch.id },
            data: { sentCount: sent, status: "completed" }
        });

        return NextResponse.json({ success: true, batchId: batch.id, sentCount: sent });
    } catch (error) {
        console.error("Bulk WhatsApp Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

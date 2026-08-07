import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { WhatsAppTriggers } from "@/lib/whatsapp";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { leadIds } = body;

        if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
            return NextResponse.json({ error: "No leads selected" }, { status: 400 });
        }

        const leads = await prisma.lead.findMany({
            where: { id: { in: leadIds } }
        });

        let successCount = 0;
        let failCount = 0;

        for (const lead of leads) {
            if (!lead.guestPhone) {
                failCount++;
                continue;
            }

            try {
                if (lead.serviceType === "retailer" || lead.serviceType === "pharmacy") {
                    await WhatsAppTriggers.outreachRetailer(lead.guestPhone, lead.guestName);
                } else if (lead.serviceType === "doctor" || lead.serviceType === "clinic") {
                    await WhatsAppTriggers.outreachDoctor(lead.guestPhone, lead.guestName);
                } else if (lead.serviceType === "hospital") {
                    await WhatsAppTriggers.outreachHospital(lead.guestPhone, lead.guestName);
                } else {
                    // Default fallback
                    await WhatsAppTriggers.outreachRetailer(lead.guestPhone, lead.guestName);
                }

                // Update status
                await prisma.lead.update({
                    where: { id: lead.id },
                    data: { status: "contacted", lastContactDate: new Date() }
                });

                successCount++;
            } catch (err) {
                console.error(`Failed outreach to lead ${lead.id}:`, err);
                failCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Outreach completed. Sent: ${successCount}, Failed: ${failCount}`
        });

    } catch (error) {
        console.error("Outreach API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

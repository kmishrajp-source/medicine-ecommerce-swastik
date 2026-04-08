import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, phone, problem, location, source, campaign, serviceType } = body;

        // Log the lead into the database for Module 3 & 5
        const lead = await prisma.lead.create({
            data: {
                guestName: name,
                guestPhone: phone,
                details: `Problem: ${problem} | Location: ${location}`,
                source: source || 'direct',
                serviceType: serviceType || 'general',
                status: 'new',
                notes: `Marketing Campaign: ${campaign || 'none'}`
            }
        });

        // ROI Tracking (optional integration point)
        console.log(`[MARKETING] New Lead Logged: ${lead.id} from ${source}`);

        return NextResponse.json({ success: true, leadId: lead.id });
    } catch (error) {
        console.error("Marketing lead capture error:", error);
        return NextResponse.json({ success: false, error: "Failed to log lead" }, { status: 500 });
    }
}

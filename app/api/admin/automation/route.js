import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { WhatsAppTriggers } from "@/lib/whatsapp";

/**
 * Admin Automation Webhook (For Make/Integromat integration)
 * This endpoint allows external scrapers or logic to ingest leads and trigger 
 * automated healthcare outreach flows.
 */

export async function POST(req) {
    // API KEY Verification (Optional but recommended)
    const authHeader = req.headers.get('authorization');
    if (process.env.ADMIN_AUTOMATION_SECRET && authHeader !== `Bearer ${process.env.ADMIN_AUTOMATION_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { 
            name, 
            phone, 
            serviceType, 
            area, 
            source = "automation", 
            notes, 
            triggerWhatsApp = true 
        } = body;

        if (!phone || !serviceType) {
            return NextResponse.json({ error: "Phone and ServiceType are required" }, { status: 400 });
        }

        // 1. Create the Lead in CRM
        const lead = await prisma.lead.create({
            data: {
                guestName: name,
                guestPhone: phone,
                serviceType: serviceType.toLowerCase(),
                area: area || "Gorakhpur",
                source: source,
                notes: notes || `Auto-ingested from ${source}`,
                status: "new"
            }
        });

        // 2. Trigger Automated WhatsApp Outreach based on category
        let whatsappStatus = "skipped";
        if (triggerWhatsApp) {
            try {
                switch (serviceType.toLowerCase()) {
                    case 'doctor':
                        await WhatsAppTriggers.outreachDoctor(phone, name);
                        break;
                    case 'retailer':
                    case 'pharmacy':
                        await WhatsAppTriggers.outreachRetailer(phone, name);
                        break;
                    case 'hospital':
                        await WhatsAppTriggers.outreachHospital(phone, name);
                        break;
                    case 'lab':
                        await WhatsAppTriggers.outreachLab(phone, name);
                        break;
                    default:
                        console.log(`No specific outreach template for type: ${serviceType}`);
                }
                whatsappStatus = "sent";
            } catch (err) {
                console.error("WhatsApp Integration Error:", err);
                whatsappStatus = "failed";
            }
        }

        return NextResponse.json({ 
            success: true, 
            leadId: lead.id, 
            whatsappStatus,
            message: "Lead ingested and automation triggered successfully."
        });

    } catch (error) {
        console.error("Automation Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * GET handler for simple connectivity check from Make
 */
export async function GET() {
    return NextResponse.json({ status: "active", module: "Healthcare Automation Engine" });
}

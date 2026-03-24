import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
    try {
        const body = await req.json();
        console.log("[WHATSAPP WEBHOOK] Received:", JSON.stringify(body, null, 2));

        // Meta/WATI/Twilio message structure varies, but we extract common fields
        let from = body.waId || body.senderNumber || body.From?.replace('whatsapp:', '');
        let text = (body.text || body.messageText || body.Body || "").toUpperCase();

        if (from && text.includes("YES")) {
            // Find Lead by Phone (normalized)
            const cleanPhone = from.slice(-10); // Last 10 digits
            const lead = await prisma.lead.findFirst({
                where: {
                    OR: [
                        { guestPhone: { contains: cleanPhone } },
                        { guestPhone: { contains: from } }
                    ]
                },
                orderBy: { createdAt: 'desc' }
            });

            if (lead) {
                await prisma.lead.update({
                    where: { id: lead.id },
                    data: { 
                        status: "interested",
                        notes: (lead.notes || "") + "\n[System] Marked interested via WhatsApp reply."
                    }
                });
                console.log(`[WHATSAPP WEBHOOK] Lead ${lead.id} marked as interested.`);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("WhatsApp Webhook Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// GET for Meta Webhook Verification
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
}

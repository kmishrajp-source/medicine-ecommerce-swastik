import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
    try {
        const body = await req.json();
        console.log("[WHATSAPP WEBHOOK] Received:", JSON.stringify(body, null, 2));

        // Meta/WATI/Twilio message structure varies, but we extract common fields
        let from = body.waId || body.senderNumber || body.From?.replace('whatsapp:', '') || body.contacts?.[0]?.wa_id;
        let text = (body.text || body.messageText || body.Body || body.messages?.[0]?.text?.body || "").toUpperCase();
        let status = body.status || body.statuses?.[0]?.status; // delivered, read, sent, failed
        let messageId = body.id || body.statuses?.[0]?.id;

        // 1. Handle Status Updates (delivered/read)
        if (status) {
            console.log(`[WHATSAPP WEBHOOK] Status Update: ${status} for ${from}`);
            // Find the most recent active batch for this number or general stats
            // In a real system, we'd use messageId mapping. For now, we update the latest campaign.
            const latestBatch = await prisma.whatsappBatch.findFirst({
                where: { status: { in: ['in_progress', 'completed'] } },
                orderBy: { createdAt: 'desc' }
            });

            if (latestBatch) {
                if (status === 'delivered') {
                    await prisma.whatsappBatch.update({
                        where: { id: latestBatch.id },
                        data: { deliveredCount: { increment: 1 } }
                    });
                } else if (status === 'read') {
                    await prisma.whatsappBatch.update({
                        where: { id: latestBatch.id },
                        data: { readCount: { increment: 1 } }
                    });
                }
            }
        }

        // 2. Handle Incoming Replies
        if (from && text) {
            // Normalize phone
            const cleanPhone = from.slice(-10);
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
                const updateData = {
                    lastAction: `WhatsApp Reply: "${text.slice(0, 20)}..."`,
                    updatedAt: new Date()
                };

                // Specific "YES" logic
                if (text.includes("YES")) {
                    updateData.status = "interested";
                    updateData.qualityScore = 90;
                    if (!lead.tags.includes("HIGH_INTENT")) {
                        updateData.tags = { push: "HIGH_INTENT" };
                    }
                    updateData.notes = (lead.notes || "") + `\n[System] Marked HIGH_INTENT via "YES" reply. (${new Date().toLocaleString()})`;
                } else {
                    // General replied status boost
                    updateData.qualityScore = Math.min((lead.qualityScore || 0) + 10, 80);
                    updateData.notes = (lead.notes || "") + `\n[System] Replied to WhatsApp. (${new Date().toLocaleString()})`;
                }

                await prisma.lead.update({
                    where: { id: lead.id },
                    data: updateData
                });
                console.log(`[WHATSAPP WEBHOOK] Updated Lead ${lead.id} on reply.`);
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

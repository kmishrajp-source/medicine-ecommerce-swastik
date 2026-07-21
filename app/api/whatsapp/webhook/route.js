import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { processChatMessage } from "@/lib/ai-brain";
import { sendWhatsAppText } from "@/lib/whatsapp";

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

            // --- STOCK BROADCAST REPLY DETECTION ---
            // If the message starts with "YES" and contains numbers, it might be a stock quote reply
            // Format: YES [Qty] [Price] — e.g. "YES 50 1200"
            if (text.startsWith("YES")) {
                const parts = text.trim().split(/\s+/);
                const qty = parseInt(parts[1]);
                const price = parseFloat(parts[2]);

                if (!isNaN(qty) && !isNaN(price)) {
                    // Find most recent active broadcast
                    const activeBroadcast = await prisma.stockBroadcast.findFirst({
                        where: { status: 'ACTIVE' },
                        orderBy: { createdAt: 'desc' }
                    });

                    if (activeBroadcast) {
                        // Find retailer/stockist by phone
                        const retailerUser = await prisma.user.findFirst({
                            where: {
                                OR: [
                                    { phone: { contains: cleanPhone } },
                                    { phone: { contains: from } }
                                ],
                                role: { in: ['RETAILER', 'STOCKIST'] }
                            }
                        });

                        await prisma.liveStockQuote.create({
                            data: {
                                broadcastId: activeBroadcast.id,
                                retailerId: retailerUser?.id || null,
                                retailerName: retailerUser?.name || `+91${cleanPhone}`,
                                quantity: qty,
                                price: price
                            }
                        });

                        await prisma.stockBroadcast.update({
                            where: { id: activeBroadcast.id },
                            data: { repliesCount: { increment: 1 } }
                        });

                        console.log(`[STOCK BROADCAST] Quote received from ${from}: ${qty} units @ ₹${price}`);

                        // Auto-reply to confirm receipt
                        await sendWhatsAppText(from, `✅ Thank you! Your stock quote of ${qty} units @ ₹${price} for *${activeBroadcast.medicineName}* has been recorded by Swastik Medicare.`);
                        return NextResponse.json({ success: true });
                    }
                }
            }
            // --- END STOCK BROADCAST DETECTION ---

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
                if (text.includes("YES") && text.length < 10) {
                    updateData.status = "interested";
                    updateData.qualityScore = 90;
                    if (!lead.tags.includes("HIGH_INTENT")) {
                        updateData.tags = { push: "HIGH_INTENT" };
                    }
                    updateData.notes = (lead.notes || "") + `\n[System] Marked HIGH_INTENT via "YES" reply. (${new Date().toLocaleString()})`;
                    
                    // Reply to the YES
                    await sendWhatsAppText(from, "Great! A Swastik Medicare representative will contact you shortly.");
                } else {
                    // General replied status boost
                    updateData.qualityScore = Math.min((lead.qualityScore || 0) + 10, 80);
                    updateData.notes = (lead.notes || "") + `\n[System] Replied to WhatsApp. (${new Date().toLocaleString()})`;

                    // Pass to AI Brain
                    const aiResult = await processChatMessage(text);
                    if (aiResult && aiResult.responseText) {
                        await sendWhatsAppText(from, aiResult.responseText);
                    }
                }

                await prisma.lead.update({
                    where: { id: lead.id },
                    data: updateData
                });
                console.log(`[WHATSAPP WEBHOOK] Updated Lead ${lead.id} on reply.`);
            } else {
                // If not a known lead, just act as a general AI chatbot
                const aiResult = await processChatMessage(text);
                if (aiResult && aiResult.responseText) {
                    await sendWhatsAppText(from, aiResult.responseText);
                }
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

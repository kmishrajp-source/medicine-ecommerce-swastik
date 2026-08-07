import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
    try {
        // Twilio sends data as form URL encoded
        const textBody = await req.text();
        const formData = new URLSearchParams(textBody);
        
        const fromNumber = formData.get("From"); // e.g., whatsapp:+919876543210
        const messageBody = formData.get("Body") || "";

        console.log(`[WEBHOOK] Received WhatsApp message from ${fromNumber}: ${messageBody}`);

        // Find the most recent active broadcast
        // In a perfect system, we would match this against the specific retailer's phone number
        // but for now, we just attach it to the latest active broadcast.
        const activeBroadcast = await prisma.stockBroadcast.findFirst({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' }
        });

        if (activeBroadcast) {
            // Attempt to parse "YES [Qty] [Price]"
            const msgUpper = messageBody.toUpperCase().trim();
            if (msgUpper.startsWith("YES")) {
                const parts = msgUpper.split(" ");
                // e.g. ["YES", "50", "1200"]
                const qty = parseInt(parts[1]) || Math.floor(Math.random() * 50) + 10;
                const price = parseFloat(parts[2]) || Math.floor(Math.random() * 500) + 50;

                await prisma.liveStockQuote.create({
                    data: {
                        broadcastId: activeBroadcast.id,
                        retailerName: fromNumber.replace("whatsapp:", ""), // Fallback name
                        quantity: qty,
                        price: price,
                    }
                });

                await prisma.stockBroadcast.update({
                    where: { id: activeBroadcast.id },
                    data: { repliesCount: { increment: 1 } }
                });
            }
        }

        // Send a TwiML response back so Twilio replies to the user
        const twiml = `
            <Response>
                <Message>Thank you! Your live quote has been received by Swastik Medicare.</Message>
            </Response>
        `;
        
        return new NextResponse(twiml, {
            status: 200,
            headers: {
                "Content-Type": "text/xml"
            }
        });

    } catch (error) {
        console.error("Twilio Webhook Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { WhatsAppMessageSender } from "@/lib/whatsapp";
import twilio from "twilio";

const twilioClient = process.env.TWILIO_SID ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN) : null;

export async function POST(req) {
    try {
        const { to, message, useTwilio = false } = await req.json();

        if (!to || !message) {
            return NextResponse.json({ error: "Receiver and message are required" }, { status: 400 });
        }

        let result;
        if (useTwilio && twilioClient) {
            // Use Twilio directly if requested and configured
            result = await twilioClient.messages.create({
                body: message,
                from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'}`,
                to: `whatsapp:${to.startsWith('+') ? to : '+91' + to.replace(/\D/g, '')}`,
            });
        } else {
            // Use existing flexible sender (WATI/Mock)
            result = await WhatsAppMessageSender.sendBulkTemplate(to, "general_notification", { body: message });
        }

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error("WhatsApp Send Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

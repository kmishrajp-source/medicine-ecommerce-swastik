import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from 'openai';
import { sendSMS } from "@/lib/sms";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
    try {
        const body = await req.json();
        // Assuming standard payload from SMS provider: { sender: "919999999999", message: "Yes I want to join" }
        const { sender, message } = body;

        if (!sender || !message) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // Clean phone string
        let cleanPhone = String(sender).replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

        // Find outreach record
        const outreach = await prisma.retailerOutreachCampaign.findFirst({
            where: { phone: cleanPhone },
            include: { retailer: true }
        });

        if (!outreach) {
            // Not a retailer in an outreach campaign
            return NextResponse.json({ success: true, message: "Ignored: No active outreach found for this number." });
        }

        // Use AI to classify the response
        let verdict = "UNKNOWN";
        try {
            if (process.env.OPENAI_API_KEY) {
                const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "You are classifying an SMS reply from a pharmacy retailer who was invited to join a healthcare platform. Classify the intent into exactly one of these categories: INTERESTED, NOT_INTERESTED, NEEDS_INFO, STOP, or UNKNOWN. Reply with only the single uppercase word." },
                        { role: "user", content: message }
                    ],
                    max_tokens: 10,
                    temperature: 0
                });
                verdict = completion.choices[0].message.content.trim().toUpperCase();
            } else {
                // Mock AI if no key
                const lowerMsg = message.toLowerCase();
                if (lowerMsg.includes('yes') || lowerMsg.includes('interested') || lowerMsg.includes('join')) verdict = "INTERESTED";
                else if (lowerMsg.includes('no') || lowerMsg.includes('stop') || lowerMsg.includes('unsubscribe')) verdict = "STOP";
                else verdict = "NEEDS_INFO";
            }
        } catch (aiErr) {
            console.error("AI parsing error:", aiErr);
            verdict = "UNKNOWN";
        }

        // Update database
        await prisma.retailerOutreachCampaign.update({
            where: { id: outreach.id },
            data: {
                responded: true,
                aiVerdict: verdict
            }
        });

        // Optional: Send auto-reply based on verdict
        let autoReply = "";
        if (verdict === "INTERESTED") {
            autoReply = `Awesome! Please sign up here: https://swastikmedicare.in/retailer/login or call us at +91-7992122974 for assistance.`;
            await sendSMS(cleanPhone, autoReply);
        } else if (verdict === "NEEDS_INFO") {
            autoReply = `Our team will call you shortly to explain the benefits. In the meantime, check out our guide: https://youtu.be/dQw4w9WgXcQ`;
            await sendSMS(cleanPhone, autoReply);
        } else if (verdict === "STOP" || verdict === "NOT_INTERESTED") {
            // No auto-reply needed, just stop sending
        }

        return NextResponse.json({
            success: true,
            verdict,
            updatedOutreach: outreach.id
        });

    } catch (error) {
        console.error("SMS Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

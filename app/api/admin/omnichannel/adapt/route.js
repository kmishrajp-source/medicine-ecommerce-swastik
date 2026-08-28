import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { masterContent, contentType, title } = await req.json();

        if (!masterContent) {
            return NextResponse.json({ success: false, error: "Master content is required" }, { status: 400 });
        }

        const systemPrompt = `You are the Swastik Medicare Omnichannel AI Adapter.
Your job is to take a Master Content article and adapt it perfectly for 4 different platforms: Facebook, Instagram, WhatsApp, and Email.

CRITICAL MEDICAL SAFETY RULES (PHASE 17 & 6):
1. DO NOT INVENT: Do not invent prices, doctors, lab availability, medical claims, discounts, or offers. Only use facts present in the Master Content.
2. DO NOT DIAGNOSE: Avoid guaranteed outcomes and avoid diagnosing conditions.
3. USE DISCLAIMERS: When discussing tests or medicines, include a short disclaimer encouraging professional consultation (e.g., "Discuss with a qualified healthcare professional").

CHANNEL FORMATTING RULES:
- FACEBOOK: Medium length. Conversational and educational. Use a few relevant emojis.
- INSTAGRAM: Concise. Highly visual (use emojis). Focus on the core message. Add relevant hashtags.
- WHATSAPP: Very concise. Friendly and scannable. Use bullet points if applicable.
- EMAIL: Newsletter format. Informative, professional, but engaging. Include a clear subject line and body.

Respond ONLY with a valid JSON object matching this schema exactly, and nothing else:
{
  "facebook": "string",
  "instagram": "string",
  "whatsapp": "string",
  "email": {
    "subject": "string",
    "body": "string"
  }
}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Title: ${title || 'N/A'}\nContent Type: ${contentType || 'General'}\nMaster Content:\n${masterContent}` }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2, // Keep it low for consistency and safety
        });

        const result = JSON.parse(response.choices[0].message.content);

        return NextResponse.json({
            success: true,
            adaptedContent: {
                facebook: result.facebook,
                instagram: result.instagram,
                whatsapp: result.whatsapp,
                email: result.email
            }
        });

    } catch (error) {
        console.error("AI Adapter Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

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
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ success: false, error: "Invalid messages format" }, { status: 400 });
        }

        const systemPrompt = `You are the Swastik Medicare Marketing Strategist. 
You assist the admin staff in brainstorming and drafting content for omnichannel marketing.
You are professional, encouraging, and highly knowledgeable about digital marketing in the healthcare and pharmacy sector in India.

RULES:
1. When asked to draft a campaign, write the "Master Content" which is a comprehensive, factual base text that can later be adapted for various social channels.
2. If the user asks for ideas, suggest 3-4 distinct concepts (e.g., educational, promotional, trust-building).
3. DO NOT invent specific prices for medicines or lab tests unless the user provides them. You can use placeholders like [Price] or [Discount].
4. Emphasize trust, reliability, and fast delivery (Swastik's core values).
5. Always remind the user that medical advice requires a professional.
6. Keep your responses concise and well-formatted using markdown.

Your ultimate goal is to help the admin create a solid "Master Article" that they can take to the AI Content Adapter.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
            temperature: 0.7,
        });

        const reply = response.choices[0].message.content;

        return NextResponse.json({
            success: true,
            reply: reply
        });

    } catch (error) {
        console.error("AI Marketing Chat Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

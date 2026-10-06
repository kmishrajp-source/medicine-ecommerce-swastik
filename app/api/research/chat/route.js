import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
    try {
        const body = await req.json();
        const { messages } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
        }

        const systemMessage = {
            role: "system",
            content: `You are the Swastik AI Research & Bioinformatics Assistant. 
You specialize in genomics, clinical data analysis, medical literature, and bioinformatics.
CRITICAL RULES:
1. Always state clearly: "I am an AI research assistant. My responses are for research and informational purposes only and do not replace professional medical diagnosis, laboratory testing, or clinical judgment."
2. Never claim that Swastik Medicare has a validated cure, diagnostic test, or biomarker for a disease unless explicitly given in context.
3. Provide academic, highly detailed, and biologically accurate responses.
4. If a user asks for personal medical advice, firmly direct them to consult a qualified healthcare professional or use the Swastik Doctor Consultation portal.`
        };

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [systemMessage, ...messages],
            temperature: 0.3, // Lower temperature for more factual responses
            max_tokens: 1000,
        });

        return NextResponse.json({
            success: true,
            message: response.choices[0].message
        });

    } catch (error) {
        console.error("Research AI Chat Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to generate AI response." },
            { status: 500 }
        );
    }
}

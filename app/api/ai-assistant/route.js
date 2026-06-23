import { NextResponse } from "next/server";
import { processChatMessage } from "@/lib/ai-brain";

export async function POST(req) {
    try {
        const { message } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const aiResult = await processChatMessage(message);

        return NextResponse.json({
            success: true,
            response: aiResult.responseText,
            disclaimer: aiResult.disclaimer,
            sources: aiResult.sources
        });

    } catch (error) {
        console.error("AI Assistant Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { processChatMessage } from "@/lib/ai-brain";
import { translateToEnglish, addHindiPrefix } from "@/lib/hindi-translate";

export async function POST(req) {
    try {
        const { message, messages } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // Feature 4: Hindi/Hinglish Translation Layer
        const { translated, wasHindi } = translateToEnglish(message);
        const messageToProcess = wasHindi ? translated : message;

        const aiResult = await processChatMessage(messageToProcess, messages);

        // Prepend Hindi acknowledgment if original message was Hindi/Hinglish
        const finalResponse = addHindiPrefix(aiResult.responseText, wasHindi);

        return NextResponse.json({
            success: true,
            response: finalResponse,
            disclaimer: aiResult.disclaimer,
            sources: aiResult.sources,
            detectedLanguage: wasHindi ? "hi" : "en"
        });

    } catch (error) {
        console.error("AI Assistant Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

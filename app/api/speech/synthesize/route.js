import { NextResponse } from 'next/server';
import { SpeechService } from '@/lib/speech-intelligence/SpeechService';

export async function POST(request) {
  try {
    const { text, lang } = await request.json();

    if (!text) {
      return NextResponse.json({ success: false, error: "No text provided" }, { status: 400 });
    }

    // Call the TTS Service Abstraction
    const result = await SpeechService.textToSpeech(text, lang);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Speech Synthesize API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

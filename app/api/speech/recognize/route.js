import { NextResponse } from 'next/server';
import { SpeechService } from '@/lib/speech-intelligence/SpeechService';
import { LanguageIntentService } from '@/lib/speech-intelligence/LanguageIntentService';

export async function POST(request) {
  try {
    const { transcript, detectedLang, userId } = await request.json();

    if (!transcript) {
      return NextResponse.json({ success: false, error: "No transcript provided" }, { status: 400 });
    }

    // Since the frontend is using Web Speech API as a fallback, it sends the transcript directly.
    // If we were receiving raw audio, we would call SpeechService.speechToText(audio) here.
    
    // Process the transcript (Handle code-switching and route to AI agent)
    const result = await LanguageIntentService.processAndRoute(transcript, detectedLang, userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Speech Recognize API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { LanguageIntentService } from '@/lib/speech-intelligence/LanguageIntentService';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');

    if (!file) {
      return NextResponse.json({ success: false, error: "No audio file provided" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: "CONFIGURATION_REQUIRED", 
        message: "Audio transcription requires an OpenAI API Key." 
      }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // OpenAI Whisper auto-detects the spoken language.
    // verbose_json response type returns detected language code.
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      response_format: "verbose_json", // returns language detection
    });

    const transcriptText = transcription.text;
    const detectedLang = transcription.language || 'en'; // e.g. "hindi", "bengali", "english"

    console.log(`[VOICE AI] Language: ${detectedLang}, Transcript: "${transcriptText}"`);

    // Process the transcript with true multilingual normalization
    const result = await LanguageIntentService.processAndRoute(transcriptText, detectedLang, userId);

    return NextResponse.json({
      ...result,
      detectedLang,
      rawTranscript: transcriptText,
    });
  } catch (error) {
    console.error("Audio Recognize API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

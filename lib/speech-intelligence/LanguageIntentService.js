import { UnifiedNavigationAgent } from '../healthcare-intelligence/UnifiedNavigationAgent';
import OpenAI from 'openai';

/**
 * Swastik Language & Intent Service
 * Normalizes code-switched Indian languages (Hindi/Bengali/English mix)
 * into a structured intent and routes it to the existing intelligence layer.
 */
export class LanguageIntentService {
  
  /**
   * Processes a raw transcript, handles code-switching, and routes to AI.
   * @param {string} rawTranscript - The raw recognized speech text.
   * @param {string} detectedLang - The detected primary language ('en', 'hi', 'bn').
   * @param {string} userId - Optional user ID for history/context.
   */
  static async processAndRoute(rawTranscript, detectedLang, userId) {
    try {
      // Step 1: Normalize Text using OpenAI (True Multilingual Support)
      // This translates Hindi/Bengali/Mixed into clean English while preserving medical entities.
      const normalizedQuery = await this.normalizeMixedLanguage(rawTranscript);

      // Step 2: Route to existing Swastik Unified Intelligence Engine
      // We DO NOT duplicate agent logic. We reuse the UnifiedNavigationAgent.
      const aiResponse = await UnifiedNavigationAgent.processRequest(normalizedQuery, userId);

      // Step 3: Format the response
      return {
        success: true,
        originalTranscript: rawTranscript,
        normalizedQuery: normalizedQuery,
        detectedLang: detectedLang,
        intent: aiResponse.intent,
        isEmergency: aiResponse.isEmergency,
        data: aiResponse.result
      };

    } catch (error) {
      console.error("LanguageIntentService Error:", error);
      return { success: false, error: "INTENT_PROCESSING_FAILED" };
    }
  }

  static async normalizeMixedLanguage(text) {
    try {
      if (!process.env.OPENAI_API_KEY) return text;
      
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a language normalizer for a healthcare app (Swastik Medicare). Your job is to take raw voice transcripts (which may be in Hindi, Bengali, English, or a mix) and translate them into a clear, concise English command. DO NOT answer the user's question. Just translate their intent. Preserve medical terms (like CBC, Metformin, Paracetamol). Keep it short."
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.1,
      });
      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error("LLM Normalization Error:", error);
      return text; // fallback to original text
    }
  }
}

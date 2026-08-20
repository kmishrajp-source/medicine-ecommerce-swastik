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
  static _isBuyingIntent(text) {
    const q = text.toLowerCase();
    const hasAction = (
      q.includes('buy') || q.includes('order') || q.includes('purchase') ||
      q.includes('need') || q.includes('want') || q.includes('get me') ||
      q.includes('give me') || q.includes('send me') || q.includes('provide') ||
      q.includes('i want') || q.includes('i need') || q.includes('chahiye') ||
      q.includes('dena') || q.includes('de do') || q.includes('মুঝে') ||
      q.includes('মুঝ') || q.includes('দিন') || q.includes('দাও') ||
      q.includes('चाहिए') || q.includes('दे दो') || q.includes('दे दीजिए')
    );
    const hasMedicine = (
      q.includes('medicine') || q.includes('tablet') || q.includes('pill') ||
      q.includes('syrup') || q.includes('drug') || q.includes('capsule') ||
      q.includes('mg') || q.includes('ml') || q.includes('drops') ||
      q.includes('cream') || q.includes('injection') || q.includes('दवा') ||
      q.includes('दवाई') || q.includes('ওষুধ') || q.includes('गोली')
    );
    return hasAction && hasMedicine;
  }

  static async processAndRoute(rawTranscript, detectedLang, userId) {
    try {
      // Step 1: Check buy-intent on RAW transcript BEFORE normalization
      // (normalization can strip intent words like "I want", "I need", etc.)
      const rawQ = rawTranscript.toLowerCase();
      const isConfirming = /\b(yes|yeah|sure|confirm|ok|place the order|haan|ji haan)\b/i.test(rawQ);
      const isBuyingRaw = this._isBuyingIntent(rawTranscript);

      if (isBuyingRaw || isConfirming) {
        // Normalize for clean medicine extraction, then pass to SpeakToBuyAgent
        const normalizedQuery = await this.normalizeMixedLanguage(rawTranscript);
        const { SpeakToBuyAgent } = await import('./SpeakToBuyAgent.js');
        const aiResponse = await SpeakToBuyAgent.processVoiceIntent(rawTranscript, userId, normalizedQuery);
        return {
          success: true,
          originalTranscript: rawTranscript,
          normalizedQuery,
          detectedLang,
          intent: aiResponse.intent || "BUY_MEDICINE",
          isEmergency: false,
          data: aiResponse.data || { message: aiResponse.message }
        };
      }

      // Step 2: Normalize for general routing
      const normalizedQuery = await this.normalizeMixedLanguage(rawTranscript);

      // Step 3: Route to existing Swastik Unified Intelligence Engine
      const aiResponse = await UnifiedNavigationAgent.processRequest(normalizedQuery, userId);

      return {
        success: true,
        originalTranscript: rawTranscript,
        normalizedQuery,
        detectedLang,
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

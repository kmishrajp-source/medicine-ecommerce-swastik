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
      // Step 1: Normalize Text using OpenAI
      const normalizedQuery = await this.normalizeMixedLanguage(rawTranscript);

      // Step 1.5: Intercept "Buy/Order Medicine" intent for Speak-to-Buy AI
      const q = normalizedQuery.toLowerCase();
      const isBuying = (q.includes('buy') || q.includes('order') || q.includes('purchase') || q.includes('need') || q.includes('want') || q.includes('get')) && 
                       (q.includes('medicine') || q.includes('tablet') || q.includes('pill') || q.includes('syrup') || q.includes('drug') || q.includes('capsule') || q.includes('mg'));
      
      const isConfirming = /yes|yeah|sure|confirm|ok|place/i.test(q); // For conversational state machine
      
      let aiResponse;
      
      // If buying or if there is an active session (handled inside SpeakToBuyAgent)
      // Actually we will always let SpeakToBuyAgent try to process if it's a buying intent
      if (isBuying || isConfirming) {
        const { SpeakToBuyAgent } = require('./SpeakToBuyAgent');
        aiResponse = await SpeakToBuyAgent.processVoiceIntent(normalizedQuery, userId);
        
        // If it successfully processed it, we return it. If it was cancelled or failed, it returns that.
        return {
          success: true,
          originalTranscript: rawTranscript,
          normalizedQuery: normalizedQuery,
          detectedLang: detectedLang,
          intent: aiResponse.intent || "BUY_MEDICINE",
          isEmergency: false,
          data: aiResponse.data || { message: aiResponse.message }
        };
      }

      // Step 2: Route to existing Swastik Unified Intelligence Engine
      aiResponse = await UnifiedNavigationAgent.processRequest(normalizedQuery, userId);

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

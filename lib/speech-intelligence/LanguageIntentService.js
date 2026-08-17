import { UnifiedNavigationAgent } from '../healthcare-intelligence/UnifiedNavigationAgent';

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
      // Step 1: Normalize Text (Code-Switching Logic)
      // In a production system, this would use an LLM (e.g., GPT-4 or Gemini)
      // to translate mixed Hindi/Bengali/English into clean English 
      // while preserving medical entities (e.g., "मुझे CBC test book करना है" -> "I want to book a CBC test")
      const normalizedQuery = this.normalizeMixedLanguage(rawTranscript);

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

  /**
   * Simulates an LLM normalizing code-switched text.
   * Preserves medical entities like "CBC", "Metformin".
   */
  static normalizeMixedLanguage(text) {
    const lower = text.toLowerCase();
    
    // Hindi heuristics
    if (lower.includes("मुझे") && lower.includes("दवा")) {
        return "I need to order medicine";
    }
    if (lower.includes("book") && lower.includes("करना है")) {
        // e.g., "मुझे CBC test book करना है"
        return text.replace(/मुझे/g, "I want to").replace(/करना है/g, "");
    }
    
    // Bengali heuristics
    if (lower.includes("আমার") && lower.includes("ওষুধ")) {
        return "I need medicine";
    }
    if (lower.includes("খুঁজে দিন") || lower.includes("খুঁজে")) {
        return "Find a " + text;
    }

    // Default fallback - assume it's mostly understandable by the English model
    return text;
  }
}

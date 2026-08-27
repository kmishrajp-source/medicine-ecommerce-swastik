import { SpeakToBuyAgent } from '@/lib/speech-intelligence/SpeakToBuyAgent';
import { LLMChatAgent } from '@/lib/healthcare-intelligence/LLMChatAgent';
import { ApprovalTool } from './tools/ApprovalTool';

export class VoiceAgent {
  
  /**
   * Processes a raw voice transcript and routes it appropriately.
   * @param {Object} params
   * @param {string} params.transcript - The raw text from the speech-to-text service
   * @param {string} params.userId - The authenticated user ID (if any)
   */
  static async processInput({ transcript, userId }) {
    
    // Attempt Speak-to-Buy extraction first (high priority for e-commerce)
    // We treat voice as an explicit intent to buy if a medicine name is detected
    const buyResult = await SpeakToBuyAgent.processVoiceIntent(transcript, userId, transcript);

    if (buyResult.intent !== "CLARIFICATION_NEEDED" && buyResult.intent !== "SYSTEM_ERROR") {
      // It's a valid buying intent (or auth requirement)
      
      if (buyResult.intent === "PRESCRIPTION_REQUIRED") {
        // Log the Rx block via ApprovalTool (so admins can see attempted Rx purchases)
        await ApprovalTool.requestApproval({
          agentId: 'VOI_001',
          actionType: 'RX_ORDER_ATTEMPT',
          details: { transcript, productData: buyResult.data },
          userId: userId || 'GUEST'
        });
      }
      
      return buyResult;
    }

    // If it's not a buy intent (or clarification needed on buy), fall back to General Healthcare / Chat logic
    try {
      const chatResponse = await LLMChatAgent.processQuery(transcript, null);
      
      return {
        message: chatResponse.answer,
        intent: "GENERAL_CHAT",
        data: chatResponse
      };
    } catch (err) {
      console.error("[VoiceAgent] Fallback to LLMChatAgent failed:", err);
      return {
        message: "I didn't quite catch that. Could you please repeat your question or order?",
        intent: "CLARIFICATION_NEEDED",
        data: null
      };
    }
  }
}

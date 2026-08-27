import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit'; // existing generic audit logger

/**
 * AuditTool
 * A unified interface for agents to record their actions.
 */
export class AuditTool {
  
  /**
   * Log an action taken (or recommended) by an AI agent.
   * @param {Object} params
   * @param {string} params.agentId - e.g., 'SUP_001'
   * @param {string} params.actionType - Short string describing action, e.g., 'DRAFT_PO'
   * @param {string} params.userId - System user ID (if applicable/triggered by human)
   * @param {Object} params.inputContext - What triggered the agent
   * @param {Object} params.outputData - The result, recommendation, or action taken
   * @param {string} params.approvalStatus - 'AUTO', 'PENDING_HUMAN', 'REJECTED', 'APPROVED'
   * @param {boolean} params.actionTaken - True if a real-world state change occurred
   */
  static async logAgentAction({ 
    agentId, 
    actionType, 
    userId = 'SYSTEM', 
    inputContext = {}, 
    outputData = {}, 
    approvalStatus = 'AUTO', 
    actionTaken = false 
  }) {
    try {
      // Use the AIAuditLog model from Prisma for structured AI tracking
      const record = await prisma.aIAuditLog.create({
        data: {
          actionType: `${agentId}_${actionType}`,
          userId: userId, // might need adjustment if schema strictly requires relation
          aiModel: "swastik-agent-v1",
          inputContext: JSON.stringify(inputContext),
          outputData: JSON.stringify(outputData),
          approvalStatus: approvalStatus,
          actionTaken: actionTaken
        }
      });
      return record;
    } catch (err) {
      console.error("[AuditTool] Failed to write AI Audit Log:", err);
      // Fallback to basic generic audit
      await logAudit(userId, `${agentId}_${actionType}`, `Fallback log. Input: ${JSON.stringify(inputContext)}`);
      return null;
    }
  }
}

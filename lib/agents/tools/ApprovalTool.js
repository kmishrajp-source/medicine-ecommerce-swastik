import prisma from '@/lib/prisma';
import { PermissionTool } from './PermissionTool';
import { getAgentById } from '../AgentRegistry';

/**
 * ApprovalTool
 * Routes agent actions that require human approval to the centralized ApprovalRequest queue.
 */
export class ApprovalTool {
  
  /**
   * Request human approval for an agent action.
   * @param {Object} params
   * @param {string} params.agentId - e.g., 'SUP_001'
   * @param {string} params.actionType - Short string describing action, e.g., 'CREATE_PO'
   * @param {Object} params.details - Full context, recommendation, and data
   * @param {string} params.userId - System user ID or 'SYSTEM' for autonomous agents
   */
  static async requestApproval({ agentId, actionType, details, userId = 'SYSTEM' }) {
    const agent = getAgentById(agentId);
    
    // Structure the details to ensure admin context is clear
    const enrichedDetails = {
      agentName: agent ? agent.name : agentId,
      originalActionType: actionType,
      context: details,
      urgency: details.urgency || "NORMAL",
      riskLevel: details.riskLevel || "MEDIUM"
    };

    try {
      const request = await prisma.approvalRequest.create({
        data: {
          requestedById: userId === 'SYSTEM' ? null : userId,
          actionType: `AGENT_${actionType}`,
          details: JSON.stringify(enrichedDetails),
          status: "PENDING"
        }
      });
      
      console.log(`[ApprovalTool] Agent ${agentId} requested approval for ${actionType}. Request ID: ${request.id}`);
      return { success: true, requestId: request.id, status: "PENDING_APPROVAL" };
    } catch (err) {
      console.error("[ApprovalTool] Failed to create ApprovalRequest:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Safe execution wrapper: checks permission and requests approval if needed,
   * otherwise executes immediately.
   */
  static async executeSafely({ agentId, capability, actionType, details, executeFn }) {
    // 1. Check capability
    PermissionTool.verifyAgentCapability(agentId, capability);

    // 2. Check if human approval is required
    const needsApproval = PermissionTool.requiresHumanApproval(agentId, details);

    if (needsApproval) {
      // Draft mode - push to queue
      return await this.requestApproval({ agentId, actionType, details });
    } else {
      // Execute immediately
      const result = await executeFn();
      return { success: true, status: "EXECUTED", result };
    }
  }
}

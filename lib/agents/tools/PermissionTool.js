import { getAgentById } from '../AgentRegistry';

/**
 * PermissionTool
 * Enforces role-based permissions and agent capability boundaries.
 */
export class PermissionTool {
  
  /**
   * Check if an agent is allowed to perform a specific capability type.
   * @param {string} agentId 
   * @param {string} capability - 'read', 'recommend', 'draft', 'execute'
   * @throws {Error} if permission is denied.
   */
  static verifyAgentCapability(agentId, capability) {
    const agent = getAgentById(agentId);
    if (!agent) {
      throw new Error(`Permission Denied: Agent ${agentId} not found in registry.`);
    }

    if (agent.status !== "ACTIVE") {
      throw new Error(`Permission Denied: Agent ${agentId} is not ACTIVE.`);
    }

    if (!agent.permissions[capability]) {
      throw new Error(`Permission Denied: Agent ${agentId} lacks '${capability}' permission.`);
    }

    return true;
  }

  /**
   * Check if the action requires human approval before proceeding.
   * @param {string} agentId 
   * @param {Object} actionContext 
   * @returns {boolean} true if human approval is required
   */
  static requiresHumanApproval(agentId, actionContext = {}) {
    const agent = getAgentById(agentId);
    if (!agent) return true; // Default to safe

    // The registry defines the baseline policy
    if (agent.permissions.approvalRequired) {
      return true;
    }

    // Dynamic policy overrides could go here based on actionContext
    // e.g., if (actionContext.amount > 5000) return true;

    return false;
  }
}

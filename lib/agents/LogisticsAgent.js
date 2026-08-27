import prisma from '@/lib/prisma';
import { ApprovalTool } from './tools/ApprovalTool';

export class LogisticsAgent {
  
  /**
   * Evaluates a delayed delivery and recommends reassignment.
   * @param {Object} eventData 
   * @param {string} eventData.orderId
   * @param {string} eventData.riderId
   * @param {number} eventData.delayMinutes
   */
  static async processDelayTrigger(eventData) {
    const { orderId, riderId, delayMinutes } = eventData;

    // Fetch order and rider details
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order || order.status === "Delivered") {
      return { success: false, message: "Order not found or already delivered." };
    }

    // Recommendation logic
    const recommendation = `Order ${orderId} is delayed by ${delayMinutes} mins. Rider ${riderId} appears stuck. Recommend overriding assignment.`;
    
    const details = {
      orderId,
      currentRider: riderId,
      delayMinutes,
      recommendation,
      urgency: delayMinutes > 45 ? "CRITICAL" : "HIGH",
      riskLevel: "MEDIUM"
    };

    // Agent drafts reassignment and requests human approval
    const result = await ApprovalTool.requestApproval({
      agentId: 'LOG_001',
      actionType: 'REASSIGN_RIDER',
      details: details,
      userId: 'SYSTEM'
    });

    return {
      success: true,
      message: `Delay detected for order ${orderId}. Reassignment drafted and sent for approval.`,
      result
    };
  }
}

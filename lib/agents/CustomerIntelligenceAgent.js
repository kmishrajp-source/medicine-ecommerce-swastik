import prisma from '@/lib/prisma';
import { ApprovalTool } from './tools/ApprovalTool';

export class CustomerIntelligenceAgent {
  
  /**
   * Find customers inactive for > 30 days and recommend retention campaigns
   */
  static async processInactivityTrigger() {
    const inactiveThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Find customers who have at least one order but haven't ordered in 30 days
    const inactiveCustomers = await prisma.user.findMany({
      where: {
        role: { in: ["CUSTOMER", "RETAILER"] },
        orders: {
          some: {} // Has at least one order
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        deviceId: true, // phone
        role: true,
        orders: {
          select: { createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    const churnRisks = inactiveCustomers.filter(cust => {
      const lastOrder = cust.orders[0];
      return lastOrder && new Date(lastOrder.createdAt) < inactiveThreshold;
    });

    if (churnRisks.length === 0) {
      return { success: true, message: "No inactive customers found." };
    }

    const campaignDetails = {
      targetAudienceSize: churnRisks.length,
      recommendation: `Offer a 15% Reactivation Discount to ${churnRisks.length} users.`,
      urgency: "HIGH",
      riskLevel: "LOW",
      proposedCoupon: {
        code: `COMEBACK15_${Date.now().toString().slice(-4)}`,
        discountPercent: 15,
        maxUses: churnRisks.length
      },
      targetUsers: churnRisks.map(c => ({ id: c.id, name: c.name, phone: c.deviceId }))
    };

    // Agent drafts the campaign and requests human approval
    const result = await ApprovalTool.requestApproval({
      agentId: 'CUS_001',
      actionType: 'RETENTION_CAMPAIGN',
      details: campaignDetails,
      userId: 'SYSTEM' // Triggered autonomously
    });

    return {
      success: true,
      message: `Found ${churnRisks.length} inactive customers. Retention campaign drafted and sent for approval.`,
      result
    };
  }
}

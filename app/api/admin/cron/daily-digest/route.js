import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { MasterOrchestrator } from "@/lib/agents/MasterOrchestrator";
import { NotificationTool } from "@/lib/agents/tools/NotificationTool";
import { AuditTool } from "@/lib/agents/tools/AuditTool";

const ADMIN_PHONE = process.env.ADMIN_PHONE || "917992122974";

export async function GET(req) {
  // Check Authorization secret if provided
  const authHeader = req.headers.get("Authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Gather operational metrics
    const [
      activeOrdersCount,
      pendingApprovalsCount,
      lowStockCount
    ] = await Promise.all([
      prisma.order.count({
        where: { status: { notIn: ["Delivered", "Cancelled"] } }
      }),
      prisma.approvalRequest.count({
        where: { status: "PENDING" }
      }),
      prisma.pharmacyInventory.count({
        where: { stock: { lte: 10 } } // Low threshold
      })
    ]);

    // 2. Scan for inactive customers (inactive for >30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["CUSTOMER", "RETAILER"] },
        orders: { some: {} }
      },
      select: {
        orders: {
          select: { createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
    const inactiveCount = users.filter(u => u.orders[0] && new Date(u.orders[0].createdAt) < thirtyDaysAgo).length;

    // 3. Request Orchestrator to generate an executive brief
    const prompt = `System Operational Summary:
- Active Orders: ${activeOrdersCount}
- Pending Human Approvals: ${pendingApprovalsCount}
- Low Stock items: ${lowStockCount}
- Inactive Customers (>30d): ${inactiveCount}

Please analyze this metrics snapshot and provide a 2-sentence executive action report.`;

    const AIResult = await MasterOrchestrator.execute(prompt, "SYSTEM_EVENT", {
      adminId: "SYSTEM_CRON"
    });

    const brief = AIResult.message || "Metrics aggregated. AI briefing unavailable.";

    // 4. Send WhatsApp Notification to Admin
    const waMessage = `📋 *Swastik Daily Business Digest*\n\n` +
      `📦 *Active Orders:* ${activeOrdersCount}\n` +
      `⚠️ *Pending Approvals:* ${pendingApprovalsCount}\n` +
      `💊 *Low Stock Products:* ${lowStockCount}\n` +
      `👥 *Inactive Customers:* ${inactiveCount}\n\n` +
      `🤖 *AI Brief:* ${brief}`;

    // For mock template or generic message fallback in NotificationTool
    await NotificationTool.notify({
      phone: ADMIN_PHONE,
      message: waMessage,
      // If template is registered:
      templateName: "ssms_intro_v1", // Fallback to intro temp or raw text if not template-constrained
      templateVars: ["Admin", "Daily Digest"],
      channels: ["SMS"] // Fallback to SMS if WA MSG91 token lacks general templates
    });

    // 5. Audit the digest generation
    await AuditTool.logAgentAction({
      agentId: "MASTER_001",
      actionType: "DAILY_DIGEST",
      userId: "SYSTEM_CRON",
      inputContext: { activeOrdersCount, pendingApprovalsCount, lowStockCount, inactiveCount },
      outputData: { brief, waMessageSentTo: ADMIN_PHONE },
      approvalStatus: "AUTO",
      actionTaken: true
    });

    return NextResponse.json({
      success: true,
      metrics: {
        activeOrders: activeOrdersCount,
        pendingApprovals: pendingApprovalsCount,
        lowStock: lowStockCount,
        inactiveCustomers: inactiveCount
      },
      aiSummary: brief
    });

  } catch (error) {
    console.error("[CRON_ERROR] Daily Digest failure:", error);
    return NextResponse.json({ error: "Daily Digest Failure", details: error.message }, { status: 500 });
  }
}

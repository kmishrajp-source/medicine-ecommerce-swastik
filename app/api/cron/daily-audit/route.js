import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/cron/daily-audit
// This endpoint is meant to be called daily by Vercel Cron or Upstash QStash.
export async function GET(req) {
  try {
    // 1. Authenticate the cron request (Vercel adds a secret header)
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todayDate = new Date();
    todayDate.setUTCHours(0, 0, 0, 0);

    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    // --- METRICS GATHERING ---
    // 1. Orders from yesterday
    const completedOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: yesterdayDate, lt: todayDate },
        status: { in: ["Delivered", "Completed"] },
      },
    });

    const failedOrders = await prisma.order.count({
      where: {
        createdAt: { gte: yesterdayDate, lt: todayDate },
        status: { in: ["Rejected", "Cancelled", "Failed"] },
      },
    });

    let totalRevenue = 0;
    completedOrders.forEach((o) => (totalRevenue += o.total));

    // 2. Platform Commission (10%)
    const platformComm = totalRevenue * 0.1;

    // 3. Active Users (Users who placed orders or logged in - estimation)
    const activeUsers = await prisma.user.count({
      where: {
        orders: {
          some: { createdAt: { gte: yesterdayDate, lt: todayDate } },
        },
      },
    });

    // --- AUTO-FIX / SELF-CORRECTION LOOP ---
    let autoFixedCount = 0;

    // A. Detect "Stuck" Orders (Pending for > 2 days)
    const stuckOrdersDate = new Date();
    stuckOrdersDate.setDate(stuckOrdersDate.getDate() - 2);

    const stuckOrders = await prisma.order.findMany({
      where: {
        status: "Received",
        createdAt: { lt: stuckOrdersDate },
      },
      select: { id: true },
    });

    if (stuckOrders.length > 0) {
      await prisma.systemHealthLog.create({
        data: {
          component: "ORDER_ROUTING",
          issueType: "STUCK_ORDERS",
          severity: "WARNING",
          message: `Found ${stuckOrders.length} orders stuck in Received state. Admin needs to assign them.`,
          details: { orderIds: stuckOrders.map((o) => o.id) },
        },
      });
    }

    // B. Detect Negative Stock Inventory
    const negativeStock = await prisma.product.findMany({
      where: { stock: { lt: 0 } },
      select: { id: true, name: true, stock: true },
    });

    if (negativeStock.length > 0) {
      // Auto-fix: Reset stock to 0 to prevent further negative selling
      await prisma.product.updateMany({
        where: { stock: { lt: 0 } },
        data: { stock: 0 },
      });
      autoFixedCount += negativeStock.length;

      await prisma.systemHealthLog.create({
        data: {
          component: "INVENTORY",
          issueType: "NEGATIVE_STOCK",
          severity: "WARNING",
          message: `Detected ${negativeStock.length} products with negative stock.`,
          isAutoFixed: true,
          autoFixDetails: "Reset stock to 0 automatically.",
          resolvedAt: new Date(),
          details: negativeStock,
        },
      });
    }

    // --- SAVE DAILY ANALYTICS ---
    await prisma.dailyAnalytics.upsert({
      where: { date: yesterdayDate },
      update: {
        totalOrders: completedOrders.length,
        totalRevenue,
        platformComm,
        failedOrders,
        activeUsers,
        metricsPayload: { autoFixedIssues: autoFixedCount },
      },
      create: {
        date: yesterdayDate,
        totalOrders: completedOrders.length,
        totalRevenue,
        platformComm,
        failedOrders,
        activeUsers,
        metricsPayload: { autoFixedIssues: autoFixedCount },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Daily audit completed.",
      autoFixedCount,
      revenue: totalRevenue,
    });
  } catch (error) {
    console.error("Daily Audit Error:", error);
    
    // Log failure of the audit itself
    await prisma.systemHealthLog.create({
      data: {
        component: "CRON_AUDIT",
        issueType: "CRON_FAILED",
        severity: "CRITICAL",
        message: "The daily audit job crashed: " + error.message,
      },
    }).catch(console.error);

    return NextResponse.json({ error: "Failed daily audit" }, { status: 500 });
  }
}

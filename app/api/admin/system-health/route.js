import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/admin/system-health
// Logs an error/issue detected by the platform (e.g. "payment failure", "no pharmacy found").
export async function POST(req) {
  try {
    const body = await req.json();
    const { component, issueType, severity = "WARNING", message, details, isAutoFixed = false, autoFixDetails } = body;

    if (!component || !issueType || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const log = await prisma.systemHealthLog.create({
      data: {
        component,
        issueType,
        severity,
        message,
        details: details || {},
        isAutoFixed,
        autoFixDetails,
        resolvedAt: isAutoFixed ? new Date() : null, // Auto-resolve if autofixed
      },
    });

    return NextResponse.json({ success: true, log }, { status: 201 });
  } catch (error) {
    console.error("Error creating System Health Log:", error);
    return NextResponse.json({ error: "Failed to create log" }, { status: 500 });
  }
}

// GET /api/admin/system-health
// Fetches recent health logs for the Admin Dashboard
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const severity = searchParams.get("severity");

    const where = {};
    if (severity) where.severity = severity;

    const logs = await prisma.systemHealthLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Also get quick stats
    const totalUnresolved = await prisma.systemHealthLog.count({
      where: { resolvedAt: null },
    });

    const totalCritical = await prisma.systemHealthLog.count({
      where: { severity: "CRITICAL", resolvedAt: null },
    });

    return NextResponse.json({ logs, stats: { totalUnresolved, totalCritical } }, { status: 200 });
  } catch (error) {
    console.error("Error fetching System Health Logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

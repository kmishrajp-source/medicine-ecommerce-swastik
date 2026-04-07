/**
 * Swastik Master Audit Service (Server-side)
 * Records and summarizes real user behavior, funnel failures, and system issues.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const logAuditEntry = async (event, params) => {
    try {
        const { url, referrer, screen, userId, phone } = params;

        // Categorize logs based on severity
        let level = "INFO";
        if (event.includes("_sos_") || event.includes("emergency")) level = "CRITICAL";
        if (event.includes("drop_off") || event.includes("exit_intent")) level = "AUDIT_FAILURE";

        await prisma.systemLog.create({
            data: {
                level,
                feature: event,
                message: `Audit: ${event} on ${url}`,
                userId: userId || null,
                metadata: {
                    params: JSON.stringify(params),
                    referrer,
                    screen,
                    phone: phone || null,
                    timestamp: new Date().toISOString()
                }
            }
        });

        // Special handling for Step 5: Critical Intent Monitoring
        if (level === "CRITICAL") {
            await prisma.systemFailureLog.create({
                data: {
                    type: "CRITICAL_SOS_INTERCEPT",
                    error: `Critical Intent Observed: ${event}`,
                    priority: "CRITICAL",
                    userId: userId || null,
                    context: JSON.stringify(params)
                }
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Master Audit log failed:", error.message);
        return { success: false };
    }
};

export const generateAuditDailyReportData = async () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const logs = await prisma.systemLog.findMany({
        where: { createdAt: { gte: yesterday } }
    });

    // Step 7/8: Segment & Conversion Analysis
    const totalEvents = logs.length;
    const sosEvents = logs.filter(l => l.level === "CRITICAL").length;
    const failures = logs.filter(l => l.level === "AUDIT_FAILURE").length;

    // Funnel Aggregation (Pseudo)
    const funnelSteps = logs.filter(l => l.feature.startsWith("funnel_"));
    
    return {
        totalEvents,
        sosEvents,
        failures,
        funnelSteps: funnelSteps.length,
        timestamp: now.toISOString()
    };
};

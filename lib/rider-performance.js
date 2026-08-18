/**
 * Rider Performance Intelligence (Agent 3 — Monitoring + Agent 8 — Admin Operations)
 * Generates performance snapshots and the Admin AI Command Center briefing.
 */
import prisma from "./prisma";

/**
 * Compute reliability score from performance metrics.
 * Returns 0–100, higher is better.
 */
export function computeReliabilityScore({ completionRate, acceptanceRate, customerRating, avgDeliveryTimeMinutes, cancelledDeliveries, totalDeliveries }) {
    let score = 100;

    // Completion rate (max -30)
    if (completionRate < 70) score -= 30;
    else if (completionRate < 80) score -= 20;
    else if (completionRate < 90) score -= 10;
    else if (completionRate < 95) score -= 5;

    // Acceptance rate (max -20)
    if (acceptanceRate < 60) score -= 20;
    else if (acceptanceRate < 75) score -= 12;
    else if (acceptanceRate < 85) score -= 6;

    // Customer rating (max -20)
    if (customerRating < 3.0) score -= 20;
    else if (customerRating < 3.5) score -= 15;
    else if (customerRating < 4.0) score -= 8;
    else if (customerRating < 4.5) score -= 3;
    else score += 5; // Bonus for great rating

    // Cancellation ratio (max -15)
    const cancellationRate = totalDeliveries > 0 ? (cancelledDeliveries / totalDeliveries) * 100 : 0;
    if (cancellationRate > 20) score -= 15;
    else if (cancellationRate > 10) score -= 8;
    else if (cancellationRate > 5) score -= 3;

    // Speed bonus (max +10)
    if (avgDeliveryTimeMinutes > 0 && avgDeliveryTimeMinutes < 20) score += 5;
    else if (avgDeliveryTimeMinutes > 45) score -= 5;

    return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get performance tier label based on score.
 */
export function getPerformanceTier(score) {
    if (score >= 85) return "EXCELLENT";
    if (score >= 70) return "GOOD";
    if (score >= 50) return "AVERAGE";
    return "POOR";
}

/**
 * Generate a performance snapshot for a rider and update their live scores.
 */
export async function generatePerformanceSnapshot(riderId, period = "DAILY") {
    try {
        const rider = await prisma.deliveryAgent.findUnique({ where: { id: riderId } });
        if (!rider) return null;

        // Get period start
        const now = new Date();
        let periodDate;
        if (period === "DAILY") {
            periodDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (period === "WEEKLY") {
            const dayOfWeek = now.getDay();
            periodDate = new Date(now);
            periodDate.setDate(now.getDate() - dayOfWeek);
            periodDate.setHours(0, 0, 0, 0);
        } else {
            periodDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        // Count deliveries in this period
        const periodJobs = await prisma.deliveryJob.findMany({
            where: {
                acceptedRiderId: riderId,
                createdAt: { gte: periodDate }
            }
        });

        const completed = periodJobs.filter(j => j.status === "DELIVERED").length;
        const cancelled = periodJobs.filter(j => ["FAILED", "CANCELLED"].includes(j.status)).length;
        const total = periodJobs.length;

        // Calculate avg delivery time for completed jobs
        const completedWithTimes = periodJobs.filter(j => j.status === "DELIVERED" && j.acceptedAt && j.deliveredAt);
        const avgTime = completedWithTimes.length > 0
            ? completedWithTimes.reduce((acc, j) => {
                return acc + (new Date(j.deliveredAt) - new Date(j.acceptedAt)) / 60000;
            }, 0) / completedWithTimes.length
            : 0;

        const completionRate = total > 0 ? (completed / total) * 100 : rider.completionRate;
        const reliabilityScore = computeReliabilityScore({
            completionRate,
            acceptanceRate: rider.acceptanceRate,
            customerRating: rider.customerRating,
            avgDeliveryTimeMinutes: avgTime || rider.avgDeliveryTimeMinutes,
            cancelledDeliveries: cancelled,
            totalDeliveries: total
        });

        const alerts = [];
        if (rider.acceptanceRate < 60) alerts.push({ type: "LOW_ACCEPTANCE", message: `Acceptance rate ${rider.acceptanceRate.toFixed(0)}% is below 60%.` });
        if (cancelled > 2) alerts.push({ type: "HIGH_CANCELLATIONS", message: `${cancelled} cancellations this period.` });
        if (rider.customerRating < 3.5) alerts.push({ type: "LOW_RATING", message: `Customer rating ${rider.customerRating.toFixed(1)} is below 3.5.` });

        // Upsert snapshot
        const snapshot = await prisma.riderPerformanceSnapshot.upsert({
            where: { riderId_period_periodDate: { riderId, period, periodDate } },
            update: {
                deliveriesCompleted: completed,
                deliveriesCancelled: cancelled,
                avgTimeMinutes: Math.round(avgTime),
                completionRate: Math.round(completionRate * 10) / 10,
                acceptanceRate: rider.acceptanceRate,
                customerRating: rider.customerRating,
                pharmacyRating: rider.pharmacyRating,
                reliabilityScore,
                performanceTier: getPerformanceTier(reliabilityScore),
                alerts: alerts.length > 0 ? alerts : null
            },
            create: {
                riderId, period, periodDate,
                deliveriesCompleted: completed,
                deliveriesCancelled: cancelled,
                avgTimeMinutes: Math.round(avgTime),
                completionRate: Math.round(completionRate * 10) / 10,
                acceptanceRate: rider.acceptanceRate,
                customerRating: rider.customerRating,
                pharmacyRating: rider.pharmacyRating,
                reliabilityScore,
                performanceTier: getPerformanceTier(reliabilityScore),
                alerts: alerts.length > 0 ? alerts : null
            }
        });

        // Update live rider stats
        await prisma.deliveryAgent.update({
            where: { id: riderId },
            data: {
                reliabilityScore,
                avgDeliveryTimeMinutes: avgTime > 0 ? Math.round(avgTime) : rider.avgDeliveryTimeMinutes,
                completionRate: Math.round(completionRate * 10) / 10
            }
        });

        return snapshot;
    } catch (err) {
        console.error(`[PERFORMANCE] Error generating snapshot for rider ${riderId}:`, err);
        return null;
    }
}

/**
 * Detect performance alerts across all active riders.
 * Returns list of alert objects for the admin command center.
 */
export async function detectFleetAlerts() {
    try {
        const riders = await prisma.deliveryAgent.findMany({
            where: { onboardingStatus: "Active" },
            select: {
                id: true, name: true, phone: true,
                acceptanceRate: true, completionRate: true,
                customerRating: true, cancelledDeliveries: true,
                totalDeliveries: true, reliabilityScore: true
            }
        });

        const alerts = [];
        for (const rider of riders) {
            if (rider.acceptanceRate < 60 && rider.totalDeliveries > 5) {
                alerts.push({ riderId: rider.id, riderName: rider.name, type: "LOW_ACCEPTANCE", value: rider.acceptanceRate, message: `Acceptance rate critically low: ${rider.acceptanceRate.toFixed(0)}%` });
            }
            if (rider.completionRate < 75 && rider.totalDeliveries > 5) {
                alerts.push({ riderId: rider.id, riderName: rider.name, type: "LOW_COMPLETION", value: rider.completionRate, message: `Completion rate low: ${rider.completionRate.toFixed(0)}%` });
            }
            if (rider.customerRating < 3.5 && rider.totalDeliveries > 5) {
                alerts.push({ riderId: rider.id, riderName: rider.name, type: "POOR_RATING", value: rider.customerRating, message: `Customer rating critical: ${rider.customerRating.toFixed(1)}⭐` });
            }
        }

        return alerts;
    } catch (err) {
        console.error("[FLEET ALERTS]", err);
        return [];
    }
}

/**
 * Generate the Admin AI Command Center briefing.
 * Aggregates key metrics, alerts, and recommendations.
 */
export async function generateAdminBriefing() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalRiders, activeRiders, availableRiders, onlineRiders,
            todayOrders, searchingJobs, inTransitJobs, completedJobs,
            fleetAlerts, shortageZones, openFraudFlags, externalJobs, retailerJobs, customerPickupJobs] = await Promise.all([
            prisma.deliveryAgent.count(),
            prisma.deliveryAgent.count({ where: { onboardingStatus: "Active" } }),
            prisma.deliveryAgent.count({ where: { isAvailable: true, isOnline: true } }),
            prisma.deliveryAgent.count({ where: { isOnline: true } }),
            prisma.order.count({ where: { createdAt: { gte: today } } }),
            prisma.deliveryJob.count({ where: { status: { in: ["SEARCHING", "OFFERED"] } } }),
            prisma.deliveryJob.count({ where: { status: { in: ["ACCEPTED", "PICKUP_CONFIRMED", "IN_TRANSIT"] } } }),
            prisma.deliveryJob.count({ where: { status: "DELIVERED", deliveredAt: { gte: today } } }),
            detectFleetAlerts(),
            prisma.deliveryZone.count({ where: { shortageFlag: true } }),
            prisma.riderFraudFlag.count({ where: { status: "OPEN" } }),
            prisma.deliveryJob.count({ where: { deliveryMethod: "EXTERNAL_PARTNER", createdAt: { gte: today } } }),
            prisma.deliveryJob.count({ where: { deliveryMethod: "RETAILER_DELIVERY", createdAt: { gte: today } } }),
            prisma.deliveryJob.count({ where: { deliveryMethod: "CUSTOMER_PICKUP", createdAt: { gte: today } } })
        ]);

        const aiInsights = [];
        if (shortageZones > 0) aiInsights.push(`⚠️ ${shortageZones} delivery zone(s) have rider shortages. Run recruitment campaigns.`);
        if (fleetAlerts.filter(a => a.type === "LOW_ACCEPTANCE").length >= 3) aiInsights.push(`🚨 ${fleetAlerts.filter(a => a.type === "LOW_ACCEPTANCE").length} riders have critically low acceptance rates. Review and follow up.`);
        if (openFraudFlags > 0) aiInsights.push(`🔍 ${openFraudFlags} open fraud flag(s) require admin review.`);
        if (searchingJobs > 3) aiInsights.push(`📡 ${searchingJobs} orders are currently searching for a rider. Consider manual assignment.`);
        if (availableRiders === 0 && searchingJobs > 0) aiInsights.push(`🛑 No available riders but ${searchingJobs} orders need delivery. Immediate action required.`);

        return {
            summary: {
                totalRiders, activeRiders, availableRiders, onlineRiders,
                todayOrders, searchingJobs, inTransitJobs, completedJobs,
                openFraudFlags, shortageZones, externalJobs, retailerJobs, customerPickupJobs
            },
            fleetAlerts,
            aiInsights
        };
    } catch (err) {
        console.error("[ADMIN BRIEFING]", err);
        return { summary: {}, fleetAlerts: [], aiInsights: [] };
    }
}

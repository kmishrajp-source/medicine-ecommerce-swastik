/**
 * Rider Recruitment Marketing Agent (Agent 4)
 * Detects zone shortages and generates targeted recruitment campaign content.
 */
import prisma from "./prisma";

const SHORTAGE_THRESHOLD_RIDERS_PER_100_ORDERS = 2.5; // < 2.5 riders per 100 orders/month = shortage
const CRITICAL_THRESHOLD = 1.5;

/**
 * Analyze all delivery zones for rider shortages.
 * Updates DeliveryZone records with shortage flags and AI recommendations.
 */
export async function analyzeAllZones() {
    try {
        const zones = await prisma.deliveryZone.findMany();
        const results = [];

        for (const zone of zones) {
            const result = await analyzeZone(zone);
            results.push(result);
        }

        // If no zones defined, auto-generate from active rider cities/areas
        if (zones.length === 0) {
            const areas = await prisma.deliveryAgent.groupBy({
                by: ["city", "area"],
                where: { onboardingStatus: "Active", area: { not: null } },
                _count: { id: true }
            });

            for (const areaGroup of areas) {
                if (!areaGroup.area) continue;
                const zone = await prisma.deliveryZone.upsert({
                    where: { city_area: { city: areaGroup.city, area: areaGroup.area } },
                    update: {},
                    create: {
                        name: `${areaGroup.area}, ${areaGroup.city}`,
                        city: areaGroup.city,
                        area: areaGroup.area
                    }
                });
                const result = await analyzeZone(zone);
                results.push(result);
            }
        }

        return results;
    } catch (err) {
        console.error("[ZONE ANALYSIS]", err);
        return [];
    }
}

/**
 * Analyze a single delivery zone.
 */
export async function analyzeZone(zone) {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Count active riders in this area
        const activeRiders = await prisma.deliveryAgent.count({
            where: {
                city: { equals: zone.city, mode: "insensitive" },
                area: { equals: zone.area, mode: "insensitive" },
                onboardingStatus: "Active",
                isOnline: true
            }
        });

        // Count orders in last 30 days matching this city
        const ordersLast30Days = await prisma.order.count({
            where: {
                createdAt: { gte: thirtyDaysAgo },
                address: { contains: zone.area, mode: "insensitive" }
            }
        });

        // Calculate shortage metrics
        const ridersPerOrders = ordersLast30Days > 0 ? (activeRiders / ordersLast30Days) * 100 : 99;
        const shortageFlag = ridersPerOrders < SHORTAGE_THRESHOLD_RIDERS_PER_100_ORDERS && ordersLast30Days > 5;
        const shortageScore = shortageFlag
            ? Math.min(100, Math.round(((SHORTAGE_THRESHOLD_RIDERS_PER_100_ORDERS - ridersPerOrders) / SHORTAGE_THRESHOLD_RIDERS_PER_100_ORDERS) * 100))
            : 0;

        const demandLevel = ordersLast30Days > 200 ? "CRITICAL"
            : ordersLast30Days > 100 ? "HIGH"
            : ordersLast30Days > 30 ? "NORMAL"
            : "LOW";

        const recommendedRiders = shortageFlag
            ? Math.ceil(ordersLast30Days / 40) - activeRiders  // Target: 1 rider per 40 orders/month
            : 0;

        const aiRecommendation = shortageFlag
            ? generateShortageRecommendation(zone, activeRiders, ordersLast30Days, recommendedRiders)
            : null;

        // Update zone
        const updatedZone = await prisma.deliveryZone.update({
            where: { id: zone.id },
            data: {
                activeRiders,
                ordersLast30Days,
                demandLevel,
                shortageFlag,
                shortageScore,
                recommendedRiderCount: Math.max(0, recommendedRiders),
                aiRecommendation,
                lastAnalyzedAt: new Date()
            }
        });

        // Log critical shortage to SystemHealthLog
        if (shortageScore >= 70) {
            await prisma.systemHealthLog.create({
                data: {
                    component: "DELIVERY_CAPACITY",
                    issueType: "RIDER_SHORTAGE",
                    severity: shortageScore >= 85 ? "CRITICAL" : "WARNING",
                    message: `Rider shortage detected in ${zone.area}, ${zone.city}. ${activeRiders} active riders vs ${ordersLast30Days} orders/30d. Need ${recommendedRiders} more riders.`,
                    details: { zoneId: zone.id, shortageScore, activeRiders, ordersLast30Days }
                }
            }).catch(() => {});
        }

        return updatedZone;
    } catch (err) {
        console.error(`[ZONE ANALYSIS] Error analyzing zone ${zone.id}:`, err);
        return zone;
    }
}

/**
 * Generate human-readable shortage recommendation text.
 */
function generateShortageRecommendation(zone, activeRiders, orders, needed) {
    const urgency = needed >= 5 ? "urgently" : "soon";
    const bestChannel = orders > 50 ? "WhatsApp broadcast + rider referral program"
        : "Customer referral campaign + pharmacy partnership";

    return `📍 ${zone.area} needs ${needed} additional delivery partner(s) ${urgency}. `
        + `Currently ${activeRiders} active rider(s) for ${orders} orders/month. `
        + `Recommended channel: ${bestChannel}. `
        + `Launch a targeted recruitment campaign immediately.`;
}

/**
 * Generate recruitment campaign content for a specific area and channel.
 */
export function generateCampaignContent(targetArea, targetCity, channel, referralCode = null) {
    const refSuffix = referralCode ? `\n\nReferral Code: ${referralCode}` : "";
    const applyLink = `https://www.swastikmed.online/en/rider/apply${referralCode ? `?ref=${referralCode}` : ""}`;

    const templates = {
        WHATSAPP: {
            message: `🚴 *Join Swastik Medicare as a Delivery Partner in ${targetArea}!*\n\n` +
                `✅ Flexible working hours\n` +
                `✅ Earn per delivery + bonuses\n` +
                `✅ Serve your local community\n` +
                `✅ Free onboarding & training\n\n` +
                `📋 *Eligibility:* 18+, own vehicle (bike/cycle/car), valid DL & Aadhaar.\n\n` +
                `🔗 Apply Now: ${applyLink}${refSuffix}\n\n` +
                `_Swastik Medicare — Delivering Health, Locally._`,
            templateName: "rider_recruitment_wa"
        },
        SMS: {
            message: `Swastik Medicare: Earn money delivering medicines in ${targetArea}! ` +
                `Flexible hours, good pay. Apply: ${applyLink}${referralCode ? ` Code: ${referralCode}` : ""}`,
            templateName: "rider_recruitment_sms"
        },
        QR_CODE: {
            message: `Scan to join Swastik Medicare as a Delivery Partner in ${targetArea}!`,
            qrUrl: applyLink,
            templateName: "rider_qr_poster"
        },
        WEBSITE: {
            headline: `Become a Swastik Medicare Delivery Partner in ${targetArea}`,
            subheadline: `Earn flexibly by delivering medicines to patients in your neighbourhood.`,
            cta: "Apply Now",
            link: applyLink
        },
        REFERRAL_LINK: {
            message: `I'm a delivery partner with Swastik Medicare. Join me and earn! Apply: ${applyLink}`,
            templateName: "rider_referral_share"
        }
    };

    return templates[channel] || templates.WHATSAPP;
}

/**
 * Get AI-recommended channel for a given zone based on shortage score and order volume.
 */
export function recommendChannel(zone) {
    if (zone.shortageScore >= 80) {
        return ["WHATSAPP", "SMS", "REFERRAL_LINK"]; // Multi-channel blitz
    } else if (zone.shortageScore >= 50) {
        return ["WHATSAPP", "REFERRAL_LINK"];
    } else {
        return ["REFERRAL_LINK"];
    }
}

/**
 * Get channel comparison analytics across all recruitment campaigns.
 */
export async function getCampaignChannelAnalytics() {
    const campaigns = await prisma.riderRecruitmentCampaign.findMany({
        where: { applications: { gt: 0 } },
        orderBy: { createdAt: "desc" }
    });

    const byChannel = {};
    for (const c of campaigns) {
        if (!byChannel[c.channel]) byChannel[c.channel] = { applications: 0, verified: 0, activated: 0 };
        byChannel[c.channel].applications += c.applications;
        byChannel[c.channel].verified += c.verifiedRiders;
        byChannel[c.channel].activated += c.activatedRiders;
    }

    // Find best performing channel
    let bestChannel = null;
    let bestConversionRate = 0;
    for (const [ch, stats] of Object.entries(byChannel)) {
        const rate = stats.applications > 0 ? stats.activated / stats.applications : 0;
        if (rate > bestConversionRate) { bestConversionRate = rate; bestChannel = ch; }
    }

    return {
        byChannel,
        bestChannel,
        bestConversionRate: Math.round(bestConversionRate * 100),
        insight: bestChannel
            ? `${bestChannel} channel is currently producing the highest quality riders (${Math.round(bestConversionRate * 100)}% conversion to active).`
            : "Insufficient data to determine best channel. Run more campaigns."
    };
}

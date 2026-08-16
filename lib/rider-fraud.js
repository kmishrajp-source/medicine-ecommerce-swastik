/**
 * Rider Fraud Detection Agent (Agent 6)
 * Detects suspicious patterns in rider applications and referrals.
 */
import prisma from "./prisma";

const FRAUD_SCORE_THRESHOLD = 60; // Above this = flag for human review
const HIGH_FREQUENCY_REFERRAL_LIMIT = 5; // Max referrals per referrer per week

/**
 * Analyze a new rider application for fraud signals.
 * Returns a fraud score (0–100) and list of flags.
 */
export async function analyzeApplication(applicationData) {
    const { phone, referralCode, name, city, vehicleType } = applicationData;
    const flags = [];
    let fraudScore = 0;

    // 1. Check for duplicate phone number in existing riders
    const existingRider = await prisma.deliveryAgent.findFirst({ where: { phone } });
    if (existingRider) {
        flags.push({ type: "DUPLICATE_PHONE", detail: `Phone already registered to rider ${existingRider.id}`, severity: "HIGH" });
        fraudScore += 40;
    }

    // 2. Check for duplicate phone in pending applications
    const existingApp = await prisma.riderApplication.findFirst({
        where: { phone, status: { notIn: ["REJECTED"] } }
    });
    if (existingApp) {
        flags.push({ type: "DUPLICATE_PHONE", detail: `Phone already in application ${existingApp.id}`, severity: "HIGH" });
        fraudScore += 35;
    }

    // 3. Check for self-referral (referrer using their own code)
    if (referralCode) {
        const referringRider = await prisma.deliveryAgent.findFirst({ where: { riderReferralCode: referralCode } });
        if (referringRider && referringRider.phone === phone) {
            flags.push({ type: "SELF_REFERRAL", detail: "Applicant used their own referral code", severity: "HIGH" });
            fraudScore += 50;
        }

        // 4. Check high-frequency referrals from same referrer
        if (referringRider) {
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const recentReferrals = await prisma.riderReferral.count({
                where: { referrerId: referringRider.id, createdAt: { gte: weekAgo } }
            });
            if (recentReferrals >= HIGH_FREQUENCY_REFERRAL_LIMIT) {
                flags.push({ type: "HIGH_FREQUENCY", detail: `Referrer has made ${recentReferrals} referrals this week`, severity: "MEDIUM" });
                fraudScore += 20;
            }
        }
    }

    // 5. Check circular referrals (A refers B who refers A)
    if (referralCode) {
        const referrer = await prisma.deliveryAgent.findFirst({ where: { riderReferralCode: referralCode } });
        if (referrer) {
            // Check if the current applicant's existing referral code was used by this referrer
            const circularCheck = await prisma.riderReferral.findFirst({
                where: { referrerId: existingRider?.id, referralCode }
            });
            if (circularCheck) {
                flags.push({ type: "CIRCULAR_REFERRAL", detail: "Circular referral chain detected", severity: "HIGH" });
                fraudScore += 45;
            }
        }
    }

    // 6. Suspicious patterns: multiple same-name-same-city applications in short time
    const recentSimilar = await prisma.riderApplication.count({
        where: {
            name: { equals: name, mode: "insensitive" },
            city: { equals: city, mode: "insensitive" },
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
    });
    if (recentSimilar >= 3) {
        flags.push({ type: "SUSPICIOUS_ACTIVITY", detail: `${recentSimilar} similar applications from same name/city in 24h`, severity: "MEDIUM" });
        fraudScore += 15;
    }

    return {
        fraudScore: Math.min(100, fraudScore),
        fraudFlags: flags,
        requiresReview: fraudScore >= FRAUD_SCORE_THRESHOLD
    };
}

/**
 * Create a RiderFraudFlag record and optionally notify admin.
 */
export async function flagForReview(riderId, applicationId, flagType, details, severity = "MEDIUM") {
    try {
        const flag = await prisma.riderFraudFlag.create({
            data: {
                riderId: riderId || null,
                applicationId: applicationId || null,
                flagType,
                details,
                severity,
                status: "OPEN"
            }
        });

        // Log to SystemHealthLog
        await prisma.systemHealthLog.create({
            data: {
                component: "RIDER_FRAUD",
                issueType: "FRAUD_FLAG",
                severity: severity === "HIGH" ? "CRITICAL" : "WARNING",
                message: `Fraud flag (${flagType}) raised for ${riderId ? `rider ${riderId}` : `application ${applicationId}`}. Severity: ${severity}.`,
                details: { flagId: flag.id, flagType, details }
            }
        }).catch(() => {});

        return flag;
    } catch (err) {
        console.error("[FRAUD FLAG]", err);
        return null;
    }
}

/**
 * Validate a referral before paying reward.
 * Returns { valid, reason } — if not valid, reward should not be paid.
 */
export async function validateReferralForReward(referralId) {
    const referral = await prisma.riderReferral.findUnique({
        where: { id: referralId },
        include: { application: true }
    });

    if (!referral) return { valid: false, reason: "Referral not found" };
    if (referral.fraudFlag) return { valid: false, reason: "Referral has active fraud flag — admin review required" };
    if (!referral.qualifyingDeliveriesMet) return { valid: false, reason: "Qualifying deliveries not completed" };
    if (referral.status !== "QUALIFIED") return { valid: false, reason: `Status is ${referral.status}, must be QUALIFIED` };

    // Additional check: ensure referred rider is genuinely active
    if (referral.riderId) {
        const rider = await prisma.deliveryAgent.findUnique({ where: { id: referral.riderId } });
        if (!rider || rider.onboardingStatus !== "Active") {
            return { valid: false, reason: "Referred rider is not active" };
        }
        if (rider.totalDeliveries < referral.qualifyingDeliveries) {
            return { valid: false, reason: `Only ${rider.totalDeliveries} deliveries completed, need ${referral.qualifyingDeliveries}` };
        }
    }

    return { valid: true };
}

/**
 * Get fraud summary for admin dashboard.
 */
export async function getFraudSummary() {
    const [openFlags, highSeverity, flagsByType] = await Promise.all([
        prisma.riderFraudFlag.count({ where: { status: "OPEN" } }),
        prisma.riderFraudFlag.count({ where: { status: "OPEN", severity: "HIGH" } }),
        prisma.riderFraudFlag.groupBy({
            by: ["flagType"],
            where: { status: "OPEN" },
            _count: { id: true }
        })
    ]);

    return { openFlags, highSeverity, flagsByType };
}

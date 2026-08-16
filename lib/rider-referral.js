/**
 * Rider Referral Agent (Agent 5)
 * Manages referral tracking, qualifying conditions, and reward eligibility.
 */
import prisma from "./prisma";
import { sendSMS } from "./sms";
import { WhatsAppTriggers } from "./whatsapp";
import { validateReferralForReward } from "./rider-fraud";

const DEFAULT_QUALIFYING_DELIVERIES = 10;

/**
 * Generate a unique referral code for a rider or user.
 */
export function generateReferralCode(prefix, id) {
    const shortId = id.slice(-5).toUpperCase();
    return `${prefix.toUpperCase().slice(0, 3)}${shortId}`;
}

/**
 * Get or create a referral code for a delivery rider.
 */
export async function getRiderReferralCode(riderId) {
    const rider = await prisma.deliveryAgent.findUnique({ where: { id: riderId } });
    if (!rider) return null;

    if (rider.riderReferralCode) return rider.riderReferralCode;

    const code = generateReferralCode("RDR", riderId);
    await prisma.deliveryAgent.update({
        where: { id: riderId },
        data: { riderReferralCode: code }
    });
    return code;
}

/**
 * Process a new rider referral when an application is submitted.
 * Links the application to the referrer.
 */
export async function processRiderReferral(applicationId, referralCode, referrerType = "RIDER") {
    if (!referralCode) return null;
    try {
        // Find referrer (try rider first, then User)
        let referrerId = null;
        const referringRider = await prisma.deliveryAgent.findFirst({ where: { riderReferralCode: referralCode } });
        if (referringRider) {
            referrerId = referringRider.id;
            referrerType = "RIDER";
        } else {
            // Try User referral code
            const referringUser = await prisma.user.findFirst({ where: { referralCode } });
            if (referringUser) {
                referrerId = referringUser.id;
                referrerType = "CUSTOMER";
            }
        }

        if (!referrerId) return null;

        const referral = await prisma.riderReferral.create({
            data: {
                referralCode,
                referrerId,
                referrerType,
                applicationId,
                status: "APPLIED",
                qualifyingDeliveries: DEFAULT_QUALIFYING_DELIVERIES
            }
        });

        return referral;
    } catch (err) {
        console.error("[REFERRAL] Error processing referral:", err);
        return null;
    }
}

/**
 * Update referral status when application moves through stages.
 * Call this whenever application.status changes.
 */
export async function updateReferralStatus(applicationId, newStatus) {
    const referrals = await prisma.riderReferral.findMany({ where: { applicationId } });
    if (!referrals.length) return;

    const statusMap = {
        "DOCS_SUBMITTED": "APPLIED",
        "UNDER_VERIFICATION": "APPLIED",
        "VERIFIED": "VERIFIED",
        "ACTIVE": "ACTIVE",
        "REJECTED": "CANCELLED"
    };

    const referralStatus = statusMap[newStatus];
    if (!referralStatus) return;

    for (const referral of referrals) {
        await prisma.riderReferral.update({
            where: { id: referral.id },
            data: { status: referralStatus }
        });

        // Notify referrer when their referral gets verified
        if (referralStatus === "VERIFIED") {
            await notifyReferrer(referral.referrerId, referral.referrerType, "VERIFIED");
        }
        if (referralStatus === "ACTIVE") {
            await notifyReferrer(referral.referrerId, referral.referrerType, "ACTIVE");
        }
    }
}

/**
 * Check if a rider has met qualifying deliveries for all their referrals.
 * Call this after each successful delivery.
 */
export async function checkRiderQualification(riderId) {
    const rider = await prisma.deliveryAgent.findUnique({ where: { id: riderId } });
    if (!rider) return;

    // Find referrals where this rider is the referred one
    const referrals = await prisma.riderReferral.findMany({
        where: { riderId, status: { in: ["ACTIVE"] } }
    });

    for (const referral of referrals) {
        if (rider.totalDeliveries >= referral.qualifyingDeliveries && !referral.qualifyingDeliveriesMet) {
            await prisma.riderReferral.update({
                where: { id: referral.id },
                data: {
                    qualifyingDeliveriesMet: true,
                    status: "QUALIFIED",
                    rewardAmount: 500 // Default reward — configurable
                }
            });

            // Notify referrer
            await notifyReferrer(referral.referrerId, referral.referrerType, "QUALIFIED", 500);
        }
    }
}

/**
 * Link a converted rider application to referral records.
 * Call when RiderApplication converts to DeliveryAgent.
 */
export async function linkRiderToReferral(applicationId, riderId) {
    await prisma.riderReferral.updateMany({
        where: { applicationId },
        data: { riderId, status: "ACTIVE" }
    });
}

/**
 * Mark a referral reward as paid (after admin confirms bank transfer).
 */
export async function markReferralRewardPaid(referralId, adminId) {
    const { valid, reason } = await validateReferralForReward(referralId);
    if (!valid) return { success: false, reason };

    await prisma.riderReferral.update({
        where: { id: referralId },
        data: { status: "REWARD_PAID", rewardPaidAt: new Date() }
    });

    return { success: true };
}

/**
 * Get referral dashboard data for a referrer (rider or user).
 */
export async function getReferralDashboard(referrerId) {
    const referrals = await prisma.riderReferral.findMany({
        where: { referrerId },
        include: { application: { select: { name: true, phone: true, status: true } } },
        orderBy: { createdAt: "desc" }
    });

    const stats = {
        total: referrals.length,
        applied: referrals.filter(r => ["APPLIED", "INVITED"].includes(r.status)).length,
        verified: referrals.filter(r => r.status === "VERIFIED").length,
        activated: referrals.filter(r => ["ACTIVE", "QUALIFIED", "REWARD_PENDING", "REWARD_PAID"].includes(r.status)).length,
        qualified: referrals.filter(r => ["QUALIFIED", "REWARD_PENDING", "REWARD_PAID"].includes(r.status)).length,
        rewardsPending: referrals.filter(r => r.status === "QUALIFIED").reduce((s, r) => s + r.rewardAmount, 0),
        rewardsPaid: referrals.filter(r => r.status === "REWARD_PAID").reduce((s, r) => s + r.rewardAmount, 0),
        conversionRate: referrals.length > 0
            ? Math.round((referrals.filter(r => ["ACTIVE", "QUALIFIED", "REWARD_PAID"].includes(r.status)).length / referrals.length) * 100)
            : 0
    };

    return { stats, referrals };
}

/**
 * Send notification to referrer based on referral milestone.
 */
async function notifyReferrer(referrerId, referrerType, milestone, rewardAmount = 0) {
    let phone = null;
    if (referrerType === "RIDER") {
        const rider = await prisma.deliveryAgent.findUnique({ where: { id: referrerId }, select: { phone: true } });
        phone = rider?.phone;
    } else {
        const user = await prisma.user.findUnique({ where: { id: referrerId }, select: { phone: true } });
        phone = user?.phone;
    }

    if (!phone) return;

    const messages = {
        VERIFIED: "Your referred delivery partner has been verified! They're now joining the team.",
        ACTIVE: "Your referred delivery partner is now active and delivering!",
        QUALIFIED: `🎉 Your referral has completed their qualifying deliveries. You've earned ₹${rewardAmount}! Payout will be processed soon.`
    };

    const msg = messages[milestone];
    if (msg) {
        sendSMS(phone, `Swastik Medicare Referral: ${msg}`).catch(() => {});
    }
}

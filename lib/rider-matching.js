/**
 * Rider Matching AI Agent (Agent 1 — Discovery + Agent 2 — Matching)
 * Calculates suitability scores, offers jobs to riders, and advances the offer queue.
 */
import prisma from "./prisma";
import { getDistanceFromLatLonInKm } from "@/utils/routing";
import { WhatsAppTriggers } from "./whatsapp";
import { sendSMS } from "./sms";
import { sendPushNotification } from "./fcm";

const OFFER_TIMEOUT_MINUTES = 5;
const MAX_SEARCH_RADIUS_KM = 20;
const SEARCH_RADIUS_EXPANSION_KM = 3;
const MAX_OFFER_ATTEMPTS = 8;

/**
 * Calculate a suitability score (0–100) for a rider given a delivery job.
 * Higher = better match.
 */
export function calculateSuitabilityScore(rider, job) {
    let score = 100;

    // 1. Distance penalty (up to -40 points)
    const pickupDist = rider._pickupDistance || 0;
    if (pickupDist > 10) score -= 40;
    else if (pickupDist > 7) score -= 25;
    else if (pickupDist > 5) score -= 15;
    else if (pickupDist > 3) score -= 8;
    else if (pickupDist > 1) score -= 3;
    // Within 1 km = no penalty

    // 2. Reliability score bonus/penalty (up to ±15)
    const reliability = rider.reliabilityScore || 100;
    if (reliability >= 90) score += 5;
    else if (reliability >= 75) score += 0;
    else if (reliability >= 60) score -= 8;
    else score -= 15;

    // 3. Acceptance rate penalty (up to -15)
    const acceptance = rider.acceptanceRate || 100;
    if (acceptance < 60) score -= 15;
    else if (acceptance < 75) score -= 8;
    else if (acceptance < 85) score -= 3;

    // 4. Completion rate penalty (up to -15)
    const completion = rider.completionRate || 100;
    if (completion < 70) score -= 15;
    else if (completion < 85) score -= 8;
    else if (completion < 92) score -= 3;

    // 5. Customer rating bonus/penalty (up to ±10)
    const rating = rider.customerRating || 5.0;
    if (rating >= 4.8) score += 5;
    else if (rating >= 4.5) score += 2;
    else if (rating < 3.5) score -= 10;
    else if (rating < 4.0) score -= 5;

    // 6. Vehicle type suitability (up to -10)
    // Most medicine deliveries work fine with any vehicle
    if (rider.vehicleType === "BICYCLE" && pickupDist > 5) score -= 10;

    // 7. Capacity penalty if already at max
    const capacity = rider.deliveryCapacity || 3;
    const activeAssignments = rider._activeAssignments || 0;
    if (activeAssignments >= capacity) score -= 30; // Should not be offered more
    else if (activeAssignments >= capacity - 1) score -= 10;

    // 8. Last active recency (up to -10)
    if (rider.lastActiveAt) {
        const minutesAgo = (Date.now() - new Date(rider.lastActiveAt).getTime()) / 60000;
        if (minutesAgo > 60) score -= 10;
        else if (minutesAgo > 30) score -= 5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Search for eligible riders for a delivery job and offer to the best one.
 * Creates a DeliveryJob record if not already created.
 */
export async function searchRidersForJob(orderId) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                assignedRetailer: { select: { lat: true, lng: true, address: true } },
                user: { select: { name: true } }
            }
        });

        if (!order) throw new Error(`Order ${orderId} not found`);

        // Pickup location: assigned retailer lat/lng, fallback to order lat/lng
        const pickupLat = order.assignedRetailer?.lat || order.lat;
        const pickupLng = order.assignedRetailer?.lng || order.lng;
        if (!pickupLat || !pickupLng) {
            console.log(`[RIDER MATCH] Order ${orderId} has no pickup coordinates.`);
            return null;
        }

        // Create or fetch DeliveryJob
        let job = await prisma.deliveryJob.findUnique({ where: { orderId } });
        if (!job) {
            job = await prisma.deliveryJob.create({
                data: {
                    orderId,
                    pickupLat,
                    pickupLng,
                    dropLat: order.lat,
                    dropLng: order.lng,
                    pickupAddress: order.assignedRetailer?.address || "Pharmacy",
                    dropAddress: order.address || "Customer address",
                    status: "SEARCHING",
                    searchRadiusKm: 5.0
                }
            });
        }

        return await offerToNextBestRider(job.id);
    } catch (err) {
        console.error("[RIDER MATCH ERROR]", err);
        return null;
    }
}

/**
 * Find the best available rider and offer the job to them.
 */
export async function offerToNextBestRider(jobId) {
    const job = await prisma.deliveryJob.findUnique({ where: { id: jobId } });
    if (!job || ["ACCEPTED", "DELIVERED", "CANCELLED"].includes(job.status)) return null;

    if (job.offerCount >= MAX_OFFER_ATTEMPTS) {
        // No more attempts — escalate
        await prisma.deliveryJob.update({
            where: { id: jobId },
            data: { status: "FAILED", failureReason: "Max offer attempts reached" }
        });
        await logShortageAlert(job);
        return null;
    }

    // Find riders within search radius, excluding already-offered ones
    const riders = await prisma.deliveryAgent.findMany({
        where: {
            isOnline: true,
            isAvailable: true,
            onboardingStatus: "Active",
            verified: true,
            lat: { not: null },
            lng: { not: null },
            id: { notIn: job.offeredRiderIds }
        }
    });

    if (riders.length === 0 && job.searchRadiusKm < MAX_SEARCH_RADIUS_KM) {
        // Expand radius and try again
        const newRadius = Math.min(job.searchRadiusKm + SEARCH_RADIUS_EXPANSION_KM, MAX_SEARCH_RADIUS_KM);
        await prisma.deliveryJob.update({ where: { id: jobId }, data: { searchRadiusKm: newRadius } });
        console.log(`[RIDER MATCH] Expanding search radius to ${newRadius}km for job ${jobId}`);
        return await offerToNextBestRider(jobId);
    }

    // Score and rank riders
    const scoredRiders = riders
        .map(rider => {
            const dist = getDistanceFromLatLonInKm(job.pickupLat, job.pickupLng, rider.lat, rider.lng);
            if (dist > job.searchRadiusKm) return null;
            rider._pickupDistance = dist;
            rider._activeAssignments = 0; // Could query active jobs if needed
            const score = calculateSuitabilityScore(rider, job);
            return { ...rider, _score: score, _dist: dist };
        })
        .filter(Boolean)
        .sort((a, b) => b._score - a._score);

    if (scoredRiders.length === 0) {
        console.log(`[RIDER MATCH] No eligible riders within ${job.searchRadiusKm}km for job ${jobId}`);
        if (job.searchRadiusKm >= MAX_SEARCH_RADIUS_KM) {
            await prisma.deliveryJob.update({
                where: { id: jobId },
                data: { status: "FAILED", failureReason: "No riders available within max radius" }
            });
            await logShortageAlert(job);
        }
        return null;
    }

    const bestRider = scoredRiders[0];
    const timeoutAt = new Date(Date.now() + OFFER_TIMEOUT_MINUTES * 60 * 1000);

    // Build suitability score map
    const scoreMap = {};
    scoredRiders.slice(0, 5).forEach(r => { scoreMap[r.id] = r._score; });

    // Update job state
    await prisma.deliveryJob.update({
        where: { id: jobId },
        data: {
            status: "OFFERED",
            currentRiderId: bestRider.id,
            offeredRiderIds: { push: bestRider.id },
            offerCount: { increment: 1 },
            timeoutAt,
            suitabilityScores: { ...(job.suitabilityScores || {}), ...scoreMap }
        }
    });

    // Create RiderOffer record
    await prisma.riderOffer.create({
        data: {
            jobId,
            riderId: bestRider.id,
            suitabilityScore: bestRider._score,
            distanceKm: bestRider._dist,
            estimatedMinutes: Math.round(bestRider._dist * 4 + 5)
        }
    });

    // Notify rider
    const shortOrderId = job.orderId.slice(-6).toUpperCase();
    const msg = `Swastik Medicare: New delivery job! Order #${shortOrderId}. Pickup: ${job.pickupAddress?.slice(0, 40)}. Drop: ${job.dropAddress?.slice(0, 40)}. Distance: ${bestRider._dist.toFixed(1)}km. You have ${OFFER_TIMEOUT_MINUTES} mins to accept. Open: swastikmed.online/en/rider/dashboard`;

    if (bestRider.phone) {
        sendSMS(bestRider.phone, msg).catch(e => console.error("[RIDER SMS]", e.message));
        WhatsAppTriggers.riderJobOffer?.(
            bestRider.phone, shortOrderId, job.pickupAddress, job.dropAddress, bestRider._dist.toFixed(1)
        ).catch(e => console.error("[RIDER WA]", e.message));
    }

    // Push notification if userId available
    if (bestRider.userId) {
        sendPushNotification(
            bestRider.userId,
            "🚴 New Delivery Job!",
            `Order #${shortOrderId} — ${bestRider._dist.toFixed(1)}km away. Accept within ${OFFER_TIMEOUT_MINUTES} mins.`,
            "/en/rider/dashboard"
        ).catch(e => console.error("[RIDER PUSH]", e.message));
    }

    console.log(`[RIDER MATCH] Job ${jobId} offered to Rider ${bestRider.id} (score: ${bestRider._score}, dist: ${bestRider._dist.toFixed(2)}km)`);
    return { job: jobId, rider: bestRider.id, score: bestRider._score };
}

/**
 * Process rider accepting a delivery job.
 */
export async function acceptDeliveryJob(jobId, riderId) {
    const job = await prisma.deliveryJob.findUnique({ where: { id: jobId } });
    if (!job || job.currentRiderId !== riderId) {
        return { success: false, error: "Job not available or not offered to you" };
    }
    if (job.status !== "OFFERED") {
        return { success: false, error: "Job is no longer available" };
    }

    await prisma.$transaction([
        prisma.deliveryJob.update({
            where: { id: jobId },
            data: { status: "ACCEPTED", acceptedRiderId: riderId, acceptedAt: new Date() }
        }),
        prisma.riderOffer.updateMany({
            where: { jobId, riderId, response: "PENDING" },
            data: { response: "ACCEPTED", respondedAt: new Date() }
        }),
        prisma.deliveryAgent.update({
            where: { id: riderId },
            data: { isAvailable: false, lastActiveAt: new Date() }
        }),
        prisma.order.update({
            where: { id: job.orderId },
            data: { deliveryAgentId: riderId, status: "Out_for_Delivery" }
        })
    ]);

    return { success: true, jobId, orderId: job.orderId };
}

/**
 * Process rider declining a job — advance to next rider.
 */
export async function declineDeliveryJob(jobId, riderId) {
    const job = await prisma.deliveryJob.findUnique({ where: { id: jobId } });
    if (!job || job.currentRiderId !== riderId) return { success: false };

    await prisma.riderOffer.updateMany({
        where: { jobId, riderId, response: "PENDING" },
        data: { response: "DECLINED", respondedAt: new Date() }
    });

    // Update acceptance rate
    await updateAcceptanceRate(riderId, false);

    // Advance to next rider
    await offerToNextBestRider(jobId);
    return { success: true };
}

/**
 * Update a rider's rolling acceptance rate after respond/timeout.
 */
export async function updateAcceptanceRate(riderId, accepted) {
    const rider = await prisma.deliveryAgent.findUnique({ where: { id: riderId } });
    if (!rider) return;
    const total = rider.totalDeliveries + rider.cancelledDeliveries + 1;
    const newRate = accepted
        ? ((rider.acceptanceRate * (total - 1) + 100) / total)
        : ((rider.acceptanceRate * (total - 1)) / total);
    await prisma.deliveryAgent.update({
        where: { id: riderId },
        data: { acceptanceRate: Math.round(newRate * 10) / 10, lastActiveAt: new Date() }
    });
}

/**
 * Log a shortage alert to SystemHealthLog when no riders are found.
 */
async function logShortageAlert(job) {
    try {
        await prisma.systemHealthLog.create({
            data: {
                component: "RIDER_MATCHING",
                issueType: "NO_RIDER_AVAILABLE",
                severity: "WARNING",
                message: `No rider available for Order #${job.orderId.slice(-6).toUpperCase()}. Search exhausted up to ${MAX_SEARCH_RADIUS_KM}km radius.`,
                details: { orderId: job.orderId, jobId: job.id, offerCount: job.offerCount }
            }
        });
    } catch (e) { /* non-critical */ }
}

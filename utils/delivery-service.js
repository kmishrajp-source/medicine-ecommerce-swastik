import prisma from "@/lib/prisma";
import { searchRidersForJob } from "@/lib/rider-matching";

/**
 * Smart Delivery Assignment Service (Upgraded to AI Matching Engine)
 * Assigns deliveries to agents using suitability scoring and queue system.
 */
export async function autoAssignDelivery(orderId) {
    try {
        console.log(`[DELIVERY] Triggering AI Rider Search for Order ${orderId}`);

        const result = await searchRidersForJob(orderId);

        if (!result) {
            console.log(`[DELIVERY WARNING] No riders found for Order ${orderId}. Shortage alert logged.`);
            return null;
        }

        console.log(`[DELIVERY SUCCESS] Order ${orderId} entered offer queue. Best matched rider: ${result.rider} (Score: ${result.score})`);
        return result;

    } catch (error) {
        console.error("[DELIVERY ERROR]", error);
        return null;
    }
}

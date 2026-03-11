import prisma from "@/lib/prisma";
import { WhatsAppTriggers } from "@/lib/whatsapp";
import { getDistanceFromLatLonInKm } from "./routing";

/**
 * Smart Delivery Assignment Service
 * Assigns deliveries to agents based on availability and distance.
 */
export async function autoAssignDelivery(orderId) {
    try {
        console.log(`[DELIVERY] Searching for agents for Order ${orderId}`);

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order || !order.lat || !order.lng) return null;

        // 1. Find the nearest online available delivery agents
        const agents = await prisma.deliveryAgent.findMany({
            where: {
                isOnline: true,
                lat: { not: null },
                lng: { not: null }
            }
        });

        if (agents.length === 0) {
            console.log("[DELIVERY] No online agents found.");
            return null;
        }

        // 2. Sort by distance (5km limit)
        const nearbyAgents = agents.map(agent => ({
            ...agent,
            distance: getDistanceFromLatLonInKm(order.lat, order.lng, agent.lat, agent.lng)
        }))
            .filter(agent => agent.distance <= 5.0)
            .sort((a, b) => a.distance - b.distance);

        if (nearbyAgents.length === 0) {
            console.log("[DELIVERY] No online agents within 5km.");
            return null;
        }

        const bestAgent = nearbyAgents[0];

        // 3. Create the assignment record
        const assignment = await prisma.deliveryAssignment.create({
            data: {
                orderId: order.id,
                agentId: bestAgent.id,
                status: "Assigned",
                distance: bestAgent.distance,
                estimatedTime: `${Math.round(bestAgent.distance * 5 + 5)} mins`
            }
        });

        // 4. Update order status
        await prisma.order.update({
            where: { id: order.id },
            data: { deliveryAgentId: bestAgent.id }
        });

        // 5. Notify the Delivery Agent via WhatsApp
        if (bestAgent.phone) {
            await WhatsAppTriggers.deliveryOut(bestAgent.phone, order.id, bestAgent.licenseNumber, bestAgent.phone);
        }

        console.log(`[DELIVERY SUCCESS] Order ${orderId} assigned to Agent ${bestAgent.id} (${bestAgent.distance.toFixed(2)} km)`);
        return assignment;

    } catch (error) {
        console.error("[DELIVERY ERROR]", error);
        return null;
    }
}

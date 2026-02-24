import prisma from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { sendPushNotification } from "@/lib/fcm";

// Haversine formula to calculate distance between two lat/lng coordinates
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Assigns an order to the nearest online delivery agent within a 10km radius.
 * Must be triggered AFTER a Retailer accepts the order.
 */
export async function assignOrderToNearestAgent(orderId) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { assignedRetailer: true } // We need the Retailer's location to dispatch the driver
        });

        if (!order || !order.assignedRetailer || !order.assignedRetailer.lat || !order.assignedRetailer.lng) {
            console.log(`[DRIVER ROUTING ERROR] Order ${orderId} has no assigned Retailer or Pharmacy GPS is missing.`);
            return null;
        }

        // Fetch all delivery agents who are currently Online and NOT currently assigned an active delivery
        // (Assuming an agent can only handle one order at a time for Hyperlocal speed)
        const activeDeliveries = await prisma.order.findMany({
            where: {
                status: { in: ["Out_For_Delivery", "Agent_Assigned"] },
                deliveryAgentId: { not: null }
            },
            select: { deliveryAgentId: true }
        });

        const busyAgentIds = activeDeliveries.map(d => d.deliveryAgentId);

        const agents = await prisma.deliveryAgent.findMany({
            where: {
                isOnline: true,
                lat: { not: null },
                lng: { not: null },
                id: { notIn: busyAgentIds } // Filter out agents who are currently carrying an order
            }
        });

        if (agents.length === 0) {
            console.log(`[DRIVER ROUTING] No available Delivery Partners found for order ${orderId}.`);
            // The Admin or support will have to manually assign or wait for someone to come online
            return null;
        }

        // Calculate distance from the RETAILER (Pickup Point) to the Agent
        const validAgents = agents.map(agent => {
            const distance = getDistanceFromLatLonInKm(order.assignedRetailer.lat, order.assignedRetailer.lng, agent.lat, agent.lng);
            return { ...agent, distance };
        })
            .filter(agent => agent.distance <= 10.0) // 10 KM pickup radius cutoff
            .sort((a, b) => a.distance - b.distance); // Closest first

        if (validAgents.length === 0) {
            console.log(`[DRIVER ROUTING] No Delivery Partners found within 10km pickup radius for order ${orderId}.`);
            return null;
        }

        const nearestDriver = validAgents[0];

        // Assign the Order to the Nearest Driver
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                deliveryAgentId: nearestDriver.id,
                status: "Agent_Assigned"
            }
        });

        console.log(`[DRIVER ROUTING] Order ${orderId} assigned to Driver ${nearestDriver.phone} (${nearestDriver.distance.toFixed(2)} km away from pickup).`);

        // Send SMS Alert to the Driver
        if (nearestDriver.phone) {
            await sendSMS(
                nearestDriver.phone,
                `Swastik Medicare: New Delivery Assignment! Order #${orderId.slice(-6).toUpperCase()}. Pickup from ${order.assignedRetailer.shopName}. Please open your Driver App to view directions.`
            );
        }

        // Send Native Push Notification to Driver App
        if (nearestDriver.userId) {
            await sendPushNotification(
                nearestDriver.userId,
                "New Delivery Assigned! 🛵",
                `Pickup Order #${orderId.slice(-6).toUpperCase()} at ${order.assignedRetailer.shopName}.`,
                "/agent/dashboard" // Route agent to their dashboard on click
            );
        }

        return updatedOrder;

    } catch (error) {
        console.error(`[DRIVER ROUTING EXCEPTION] Failed dispatching rider for order ${orderId}:`, error);
        return null;
    }
}

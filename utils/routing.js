import prisma from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";

// Haversine formula to calculate distance between two lat/lng coordinates in kilometers
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
 * Assigns an order to the nearest online retailer within a 5km radius.
 * Sets the order status to "Pending_Retailer_Acceptance" and starts the 60s timeout clock.
 */
export async function assignOrderToNearestRetailer(orderId) {
    try {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order || !order.lat || !order.lng) {
            console.log(`[ROUTING ERROR] Order ${orderId} has no GPS coordinates.`);
            return null;
        }

        // Fetch all retailers that are currently online and have valid coordinates
        const retailers = await prisma.retailer.findMany({
            where: {
                isOnline: true,
                lat: { not: null },
                lng: { not: null }
            }
        });

        if (retailers.length === 0) {
            console.log(`[ROUTING] No online retailers found for order ${orderId}.`);
            return null;
        }

        // Compute distances and filter by 5km radius
        const validRetailers = retailers.map(r => {
            const distance = getDistanceFromLatLonInKm(order.lat, order.lng, r.lat, r.lng);
            return { ...r, distance };
        })
            .filter(r => r.distance <= 5.0) // 5 KM Radius cutoff
            .sort((a, b) => a.distance - b.distance); // Closest first

        if (validRetailers.length === 0) {
            console.log(`[ROUTING] No online retailers found within 5km radius for order ${orderId}.`);
            return null; // Will remain in "Processing" for Admin manual assignment
        }

        const nearest = validRetailers[0];

        // Assign the order to the nearest retailer
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                assignedRetailerId: nearest.id,
                assignedAt: new Date(),
                status: "Pending_Retailer_Acceptance"
            }
        });

        console.log(`[ROUTING] Order ${orderId} assigned to Retailer ${nearest.shopName} (${nearest.distance.toFixed(2)} km away).`);

        // Send SMS Alert to the Retailer
        if (nearest.phone) {
            await sendSMS(
                nearest.phone,
                `Swastik Medicare: New Medicine Order #${orderId.slice(-6).toUpperCase()} received! Please check your Retailer Dashboard to accept within 60 seconds.`
            );
        }

        return updatedOrder;

    } catch (error) {
        console.error(`[ROUTING EXCEPTION] Failed assigning order ${orderId}:`, error);
        return null;
    }
}

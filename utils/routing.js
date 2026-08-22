import prisma from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { sendPushNotification } from "@/lib/fcm";
import { WhatsAppTriggers } from "@/lib/whatsapp";

// Haversine formula to calculate distance between two lat/lng coordinates in kilometers
export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
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
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: { product: { select: { name: true, packSize: true } } }
                },
                user: { select: { name: true, phone: true } }
            }
        });
        if (!order || !order.lat || !order.lng) {
            console.log(`[ROUTING ERROR] Order ${orderId} has no GPS coordinates.`);
            return null;
        }

        // Fetch all retailers that are currently online, have valid coordinates, 
        // AND have not already declined/timed-out on this specific order.
        const retailers = await prisma.retailer.findMany({
            where: {
                isOnline: true,
                lat: { not: null },
                lng: { not: null },
                id: { notIn: order.declinedRetailers }
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

        const nearestIds = validRetailers.slice(0, 3).map(r => r.id);
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                assignedRetailerId: nearest.id,
                assignedAt: new Date(),
                status: "Pending_Retailer_Acceptance",
                nearestRetailerIds: nearestIds,
                currentRetailerIndex: 0
            }
        });

        console.log(`[ROUTING] Order ${orderId} assigned to Retailer ${nearest.shopName} (${nearest.distance.toFixed(2)} km away).`);

        // Build medicine list string for WhatsApp
        const shortId = orderId.slice(-6).toUpperCase();
        const customerName = order.guestName || order.user?.name || 'Customer';
        const customerPhone = order.guestPhone || order.user?.phone || 'N/A';
        const deliveryAddress = order.address || 'Address not provided';
        const invoiceUrl = `https://www.swastikmed.online/order/${orderId}/invoice?guest=1`;
        const medicineList = order.items.map((item, i) =>
            `${i + 1}. ${item.productName || item.product?.name || 'Medicine'} x${item.quantity}${item.product?.packSize ? ` (${item.product.packSize})` : ''}`
        ).join('\n') || 'See invoice for details';

        // Send rich WhatsApp to the retailer with full medicine list + invoice link
        if (nearest.phone) {
            WhatsAppTriggers.retailerNewOrder(
                nearest.phone,
                shortId,
                customerName,
                order.deliveryCode || '----',
                order.total,
                medicineList,
                deliveryAddress,
                invoiceUrl
            ).catch(e => console.error('[WHATSAPP RETAILER]', e.message));
        }

        // Fallback SMS (shorter, for basic phones)
        if (nearest.phone) {
            sendSMS(
                nearest.phone,
                `Swastik Medicare: New Order #${shortId} assigned!\nCustomer: ${customerName}\nAmt: Rs.${order.total}\nDelivery Code: ${order.deliveryCode}\nInvoice: ${invoiceUrl}\nAccept: swastikmed.online/en/retailer/orders`
            ).catch(e => console.error('[SMS RETAILER]', e.message));
        }

        // Push Notification to Retailer's linked User Account
        if (nearest.userId) {
            sendPushNotification(
                nearest.userId,
                "New Order Assigned! 🚨",
                `Order #${shortId} is ${nearest.distance.toFixed(1)}km away. Accept within 3 mins.`,
                "/admin/dashboard"
            ).catch(e => console.error('[PUSH RETAILER]', e.message));
        }

        return updatedOrder;

    } catch (error) {
        console.error(`[ROUTING EXCEPTION] Failed assigning order ${orderId}:`, error);
        return null;
    }
}

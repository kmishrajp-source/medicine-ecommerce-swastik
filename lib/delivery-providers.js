import prisma from "./prisma";
import { WhatsAppTriggers } from "./whatsapp";

/**
 * Find the best active external provider for a given pickup location.
 */
export async function findBestExternalProvider(pickupLat, pickupLng) {
    // Currently returns the highest priority LIVE provider.
    // In a full implementation, you could use pickupLat/pickupLng to filter by serviceCities or polygons.
    const providers = await prisma.externalDeliveryProvider.findMany({
        where: {
            isActive: true,
            status: "LIVE"
        },
        orderBy: { priority: 'asc' }
    });

    return providers.length > 0 ? providers[0] : null;
}

/**
 * Dispatch the job to an external delivery partner.
 */
export async function dispatchToExternalProvider(provider, job) {
    try {
        console.log(`[DELIVERY ORCHESTRATOR] Dispatching Job ${job.id} to External Provider: ${provider.name}`);

        // TODO: Here you would integrate with the actual provider's API (e.g. Dunzo, Shadowfax)
        // using provider.apiUrl and provider.apiKey.

        // Simulate successful dispatch for now
        const trackingUrl = `https://track.${provider.name.toLowerCase()}.com/simulated-tracking/${job.id}`;

        await prisma.$transaction([
            prisma.deliveryJob.update({
                where: { id: job.id },
                data: {
                    deliveryMethod: "EXTERNAL_PARTNER",
                    externalProviderId: provider.id,
                    externalTrackingUrl: trackingUrl,
                    status: "ACCEPTED",
                    acceptedAt: new Date()
                }
            }),
            prisma.order.update({
                where: { id: job.orderId },
                data: { status: "Out_for_Delivery" } // Update order status
            })
        ]);

        return { success: true, trackingUrl };
    } catch (err) {
        console.error(`[DELIVERY ORCHESTRATOR] Failed to dispatch to ${provider.name}`, err);
        return { success: false, error: err.message };
    }
}

/**
 * Fallback to Retailer Delivery.
 */
export async function fallbackToRetailerDelivery(job) {
    try {
        console.log(`[DELIVERY ORCHESTRATOR] Falling back to Retailer Delivery for Job ${job.id}`);
        
        const order = await prisma.order.findUnique({
            where: { id: job.orderId },
            include: { assignedRetailer: true }
        });

        if (!order || !order.assignedRetailer) {
            return { success: false, error: "No assigned retailer found" };
        }

        // Determine if retailer can actually deliver (e.g. riderPreference === "SELF" or they opt-in for fallbacks)
        // For this orchestration, we assume they must deliver if no other option.
        await prisma.$transaction([
            prisma.deliveryJob.update({
                where: { id: job.id },
                data: {
                    deliveryMethod: "RETAILER_DELIVERY",
                    status: "ACCEPTED",
                    acceptedAt: new Date()
                }
            }),
            prisma.order.update({
                where: { id: job.orderId },
                data: { 
                    status: "Out_for_Delivery",
                    isRetailerDelivering: true 
                }
            })
        ]);

        // Notify Retailer (optional: trigger WhatsApp)
        if (order.assignedRetailer.phone) {
             WhatsAppTriggers.sendRetailerNotification?.(
                 order.assignedRetailer.phone,
                 `Order #${job.orderId.slice(-6).toUpperCase()}: Swastik delivery partners are unavailable. Please arrange self-delivery for this order.`
             ).catch(() => {});
        }

        return { success: true };
    } catch (err) {
        console.error(`[DELIVERY ORCHESTRATOR] Retailer fallback failed`, err);
        return { success: false, error: err.message };
    }
}

/**
 * Fallback to Customer Pickup.
 */
export async function fallbackToCustomerPickup(job) {
    try {
        console.log(`[DELIVERY ORCHESTRATOR] Falling back to Customer Pickup for Job ${job.id}`);

        const order = await prisma.order.findUnique({
            where: { id: job.orderId },
            include: { user: true, assignedRetailer: true }
        });

        if (!order) return { success: false, error: "Order not found" };

        await prisma.$transaction([
            prisma.deliveryJob.update({
                where: { id: job.id },
                data: {
                    deliveryMethod: "CUSTOMER_PICKUP",
                    status: "CANCELLED", // Delivery itself is cancelled, pickup is required
                    failureReason: "Fell back to customer pickup"
                }
            }),
            prisma.order.update({
                where: { id: job.orderId },
                data: { status: "Ready_for_Packing" } // Waiting for customer
            })
        ]);

        // Notify Customer (optional: trigger WhatsApp)
        if (order.user?.phone || order.guestPhone) {
             const phone = order.user?.phone || order.guestPhone;
             const address = order.assignedRetailer?.address || "the pharmacy";
             WhatsAppTriggers.sendCustomerNotification?.(
                 phone,
                 `Order #${job.orderId.slice(-6).toUpperCase()}: We couldn't find a delivery partner. You can pick up your order directly from ${address}.`
             ).catch(() => {});
        }

        return { success: true };
    } catch (err) {
        console.error(`[DELIVERY ORCHESTRATOR] Customer pickup fallback failed`, err);
        return { success: false, error: err.message };
    }
}

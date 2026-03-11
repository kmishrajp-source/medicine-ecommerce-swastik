import prisma from "@/lib/prisma";

/**
 * Webhook Dispatcher Service
 * Fires event notifications to external URLs.
 */
export async function fireWebhookEvent(eventType, payload) {
    try {
        console.log(`[WEBHOOK] Checking for handlers for event: ${eventType}`);

        // 1. Fetch active webhook configurations for this event
        const configs = await prisma.webhookConfig.findMany({
            where: {
                isActive: true,
                events: { has: eventType }
            }
        });

        if (configs.length === 0) return;

        // 2. Dispatch payloads to each URL
        const dispatchPromises = configs.map(async (config) => {
            try {
                const response = await fetch(config.url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Webhook-Secret": config.secret || ""
                    },
                    body: JSON.stringify({
                        event: eventType,
                        timestamp: new Date().toISOString(),
                        data: payload
                    })
                });

                if (response.ok) {
                    console.log(`[WEBHOOK SUCCESS] Event ${eventType} sent to ${config.url}`);
                } else {
                    console.warn(`[WEBHOOK FAIL] ${config.url} returned ${response.status}`);
                }
            } catch (err) {
                console.error(`[WEBHOOK ERROR] Delivery failed to ${config.url}:`, err.message);
            }
        });

        await Promise.all(dispatchPromises);

    } catch (error) {
        console.error("[WEBHOOK DISPATCH ERROR]", error);
    }
}

/**
 * High-level triggers to be called throughout the app
 */
export const WebhookEvents = {
    ORDER_CREATED: "order_created",
    ORDER_CONFIRMED: "order_confirmed",
    OUT_FOR_DELIVERY: "order_out_for_delivery",
    DELIVERY_COMPLETED: "delivery_completed",
    PAYMENT_SUCCESS: "payment_success"
};

export function triggerWebhook(event, orderId, extraData = {}) {
    // Non-blocking call
    fireWebhookEvent(event, { orderId, ...extraData });
}

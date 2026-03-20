import prisma from "@/lib/prisma";
import { WhatsAppTriggers } from "@/lib/whatsapp";
import { getDistanceFromLatLonInKm } from "./routing";

/**
 * Calculates distance between two points
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Splits an Order into multiple SubOrders based on retailer inventory and proximity.
 * If multiple retailers are needed, it creates a SubOrder for each.
 */
export async function splitOrderIntoSubOrders(orderId) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: true } } }
        });

        if (!order || !order.lat || !order.lng) return null;

        // 1. Fetch available retailers within 10km (increased for marketplace reach)
        const retailers = await prisma.retailer.findMany({
            where: {
                isOnline: true,
                lat: { not: null },
                lng: { not: null }
            },
            include: { inventory: true }
        });

        // 2. Group items by the "best" retailer
        // Strategy: For each item, find the nearest retailer who has it in stock.
        const assignmentMap = new Map(); // retailerId -> [items]

        for (const item of order.items) {
            let bestRetailer = null;
            let minDistance = Infinity;

            for (const retailer of retailers) {
                // Check inventory
                const inventoryItem = retailer.inventory.find(i =>
                    i.medicineName.toLowerCase() === item.product.name.toLowerCase() && i.stock >= item.quantity
                );

                if (inventoryItem) {
                    const distance = calculateDistance(order.lat, order.lng, retailer.lat, retailer.lng);
                    if (distance < minDistance && distance <= 10.0) {
                        minDistance = distance;
                        bestRetailer = retailer;
                    }
                }
            }

            // Fallback: If no retailer has it in stock, assign to nearest retailer anyway (they can handle substitution later)
            if (!bestRetailer) {
                let fallbackRetailer = null;
                let fallbackMinDistance = Infinity;

                for (const retailer of retailers) {
                    const distance = calculateDistance(order.lat, order.lng, retailer.lat, retailer.lng);
                    if (distance < fallbackMinDistance) {
                        fallbackMinDistance = distance;
                        fallbackRetailer = retailer;
                    }
                }
                bestRetailer = fallbackRetailer;
            }

            if (bestRetailer) {
                if (!assignmentMap.has(bestRetailer.id)) {
                    assignmentMap.set(bestRetailer.id, []);
                }
                assignmentMap.get(bestRetailer.id).push(item);
            }
        }

        // 3. Create SubOrders
        const subOrders = [];
        for (const [retailerId, items] of assignmentMap.entries()) {
            const subOrderTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

            const subOrder = await prisma.subOrder.create({
                data: {
                    orderId: order.id,
                    retailerId: retailerId,
                    userId: order.userId,
                    items: items.map(i => ({
                        productId: i.productId,
                        name: i.product.name,
                        quantity: i.quantity,
                        price: i.price
                    })),
                    total: subOrderTotal,
                    status: "Invoice_Pending"
                }
            });
            subOrders.push(subOrder);

            // Trigger Notification to Retailer via WhatsApp
            const retailer = retailers.find(r => r.id === retailerId);
            if (retailer && retailer.phone) {
                WhatsAppTriggers.newSubOrder(retailer.phone, subOrder.id, items.length);
            }
            console.log(`[MARKETPLACE] Created SubOrder ${subOrder.id} for Retailer ${retailerId}`);
        }

        return subOrders;

    } catch (error) {
        console.error("[MARKETPLACE ERROR] Failed to split order:", error);
        throw error;
    }
}

/**
 * Logic for automatic medicine substitution
 * If a medicine is out of stock, find a substitute and update the sub-order.
 */
export async function performAutomaticSubstitution(subOrderId, outOfStockItemName) {
    try {
        console.log(`[SUBSTITUTION] Attempting substitution for ${outOfStockItemName} in SubOrder ${subOrderId}`);

        const subOrder = await prisma.subOrder.findUnique({
            where: { id: subOrderId },
            include: { order: true, retailer: true }
        });

        if (!subOrder) return null;

        // 1. Find substitution rules for this medicine
        const rule = await prisma.substitutionRule.findUnique({
            where: { sourceMedicine: outOfStockItemName }
        });

        if (!rule || !rule.isActive) {
            console.log(`[SUBSTITUTION] No active rule found for ${outOfStockItemName}`);
            return null;
        }

        // 2. Search for the substitute generic in other nearby retailers
        const retailers = await prisma.retailer.findMany({
            where: {
                isOnline: true,
                lat: { not: null },
                lng: { not: null },
                id: { not: subOrder.retailerId } // Check other shops
            },
            include: { inventory: true }
        });

        let foundSubstitute = null;
        let bestRetailer = null;

        for (const retailer of retailers) {
            const inventoryItem = retailer.inventory.find(i =>
                i.medicineName.toLowerCase() === rule.substituteGeneric.toLowerCase() && i.stock > 0
            );

            if (inventoryItem) {
                const distance = getDistanceFromLatLonInKm(subOrder.order.lat, subOrder.order.lng, retailer.lat, retailer.lng);
                if (distance <= 10.0) {
                    foundSubstitute = inventoryItem;
                    bestRetailer = retailer;
                    break; // Pick the first available one for speed
                }
            }
        }

        if (foundSubstitute && bestRetailer) {
            // 3. Create a NEW SubOrder for the substitute retailer
            const newSubOrder = await prisma.subOrder.create({
                data: {
                    orderId: subOrder.orderId,
                    retailerId: bestRetailer.id,
                    userId: subOrder.userId,
                    items: [{
                        productId: foundSubstitute.id,
                        name: foundSubstitute.medicineName,
                        quantity: 1, // Assumption or match original
                        price: foundSubstitute.price,
                        isSubstitution: true,
                        originalItem: outOfStockItemName
                    }],
                    total: foundSubstitute.price,
                    status: "Invoice_Pending"
                }
            });

            // 4. Notify Customer and Admin via WhatsApp
            const adminPhone = "9161364908"; 
            if (subOrder.order.guestPhone || subOrder.user?.phone) {
                const customerPhone = subOrder.order.guestPhone || subOrder.user.phone;
                await WhatsAppTriggers.customerSubstitutionAlert(customerPhone, subOrder.orderId, foundSubstitute.medicineName);
            }
            await WhatsAppTriggers.substitutionAlert(adminPhone, subOrder.orderId, foundSubstitute.medicineName);

            console.log(`[SUBSTITUTION SUCCESS] Substituted ${outOfStockItemName} with ${foundSubstitute.medicineName} from ${bestRetailer.shopName}`);
            return newSubOrder;
        }

        return null;

    } catch (error) {
        console.error("[SUBSTITUTION ERROR]", error);
        return null;
    }
}

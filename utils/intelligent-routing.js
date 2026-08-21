import prisma from "@/lib/prisma";
import { getDistanceFromLatLonInKm } from "./routing"; // Reuse existing distance logic
import { WhatsAppTriggers, sendWhatsAppText } from "@/lib/whatsapp";

/**
 * Intelligent Simultaneous Order Routing
 * This algorithm compares Retailer vs Stockist prices dynamically, selects the most profitable
 * and fastest route, and dispatches the Delivery Agent immediately.
 */
export async function executeIntelligentRouting(orderId) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: { product: true }
                },
                user: true
            }
        });

        if (!order || !order.lat || !order.lng) {
            console.log(`[AI-ROUTING] Order ${orderId} has no coordinates. Manual assignment required.`);
            return null;
        }

        const items = order.items;
        let totalRetailerCost = 0;
        let totalStockistCost = 0;
        let allItemsAvailableAtStockist = true;

        // 1. Check Stockist Wholesale Prices
        // In a real scenario, we'd query StockistInventory for each item.
        for (const item of items) {
            const medicineName = item.product.name;
            const stockistItem = await prisma.stockistInventory.findFirst({
                where: { medicineName: { contains: medicineName, mode: 'insensitive' } },
                orderBy: { price: 'asc' }, // Get cheapest
                include: { stockist: true }
            });

            if (stockistItem && stockistItem.stock >= item.quantity) {
                totalStockistCost += (stockistItem.price * item.quantity);
            } else {
                allItemsAvailableAtStockist = false;
            }
        }

        // 2. Determine Retailer Price (Fallback)
        // Usually retailers sell to us at MRP - 20% margin, or similar logic. 
        // For this calculation, let's assume Retailer Cost is 85% of Order Total.
        totalRetailerCost = order.total * 0.85; 
        
        let routingDecision = "RETAILER";
        let chosenPickupId = null;
        let aiDecisionText = "";

        // 3. Find optimal pickup location
        const availableStockists = await prisma.stockist.findMany({ where: { verified: true } });
        let chosenStockist = availableStockists.length > 0 ? availableStockists[0] : null;

        if (allItemsAvailableAtStockist && chosenStockist && totalStockistCost < totalRetailerCost) {
            routingDecision = "STOCKIST";
            chosenPickupId = chosenStockist.id;
            const extraMargin = totalRetailerCost - totalStockistCost;
            aiDecisionText = `AI Decision: Routed to Stockist. Saved ₹${extraMargin.toFixed(2)} in margin.`;
            console.log(`[AI-ROUTING] ${aiDecisionText}`);
        } else {
            // Find nearest retailer
            const retailers = await prisma.retailer.findMany({
                where: { isOnline: true, lat: { not: null }, lng: { not: null } }
            });
            const validRetailers = retailers.map(r => ({ ...r, distance: getDistanceFromLatLonInKm(order.lat, order.lng, r.lat, r.lng) }))
                .filter(r => r.distance <= 5.0).sort((a, b) => a.distance - b.distance);
            
            if (validRetailers.length > 0) {
                routingDecision = "RETAILER";
                chosenPickupId = validRetailers[0].id;
                aiDecisionText = `AI Decision: Routed to nearest Retailer (${validRetailers[0].distance.toFixed(1)}km away).`;
            } else {
                console.log(`[AI-ROUTING] No valid routing targets found for ${orderId}.`);
                return null;
            }
        }

        // 4. Find nearest Delivery Agent
        const agents = await prisma.deliveryAgent.findMany({
            where: { isOnline: true, lat: { not: null }, lng: { not: null } }
        });
        const validAgents = agents.map(a => ({ ...a, distance: getDistanceFromLatLonInKm(order.lat, order.lng, a.lat, a.lng) }))
            .sort((a, b) => a.distance - b.distance);
        
        let chosenAgentId = null;
        let chosenAgent = null;
        if (validAgents.length > 0) {
            chosenAgent = validAgents[0];
            chosenAgentId = chosenAgent.id;
        }

        // 5. Update Database
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                assignedRetailerId: routingDecision === "RETAILER" ? chosenPickupId : null,
                deliveryAgentId: chosenAgentId, // Direct assignment
                status: "Out_for_Delivery" // Skipping wait queues
            }
        });

        // 6. Simultaneous Dispatch (WhatsApp)
        const shortId = orderId.slice(-6).toUpperCase();
        const customerName = order.guestName || order.user?.name || 'Customer';
        const deliveryAddress = order.address || 'Address not provided';

        // Admin Notification
        WhatsAppTriggers.adminRichOrderAlert(
            "+917992122974", 
            shortId, 
            customerName, 
            order.guestPhone || "N/A",
            order.total, 
            items.length, 
            deliveryAddress, 
            `https://www.swastikmed.online/order/${orderId}/invoice?guest=1`,
            aiDecisionText
        ).catch(e => console.error(e));

        // Pickup Partner Notification (Retailer or Stockist)
        if (routingDecision === "STOCKIST" && chosenStockist?.phone) {
            sendWhatsAppText(chosenStockist.phone, `🏢 *Stockist Order #${shortId}*\n\nPlease prepare the order. A Swastik Rider is on the way to your warehouse.\nAmount to receive from rider (Wholesale): ₹${totalStockistCost.toFixed(2)}`);
        } else if (routingDecision === "RETAILER") {
            const retailer = await prisma.retailer.findUnique({ where: { id: chosenPickupId } });
            if (retailer?.phone) {
                 sendWhatsAppText(retailer.phone, `🏪 *Fast-Track Retailer Order #${shortId}*\n\nPlease pack the medicines instantly. Rider is already dispatched to your shop!`);
            }
        }

        // Delivery Agent Notification
        if (chosenAgent?.phone) {
            let pickupName = "";
            let pickupAddress = "";

            if (routingDecision === "STOCKIST" && chosenStockist) {
                pickupName = chosenStockist.agencyName;
                pickupAddress = chosenStockist.warehouseAddress;
            } else if (routingDecision === "RETAILER") {
                const retailer = await prisma.retailer.findUnique({ where: { id: chosenPickupId } });
                pickupName = retailer?.shopName || "Pharmacy";
                pickupAddress = retailer?.address || "Location on Map";
            }

            WhatsAppTriggers.simultaneousDispatchAlert(
                chosenAgent.phone,
                shortId,
                routingDecision,
                pickupName,
                pickupAddress,
                deliveryAddress,
                order.total
            ).catch(e => console.error(e));
        }

        return updatedOrder;

    } catch (error) {
        console.error("[AI-ROUTING EXCEPTION] Failed assigning order:", error);
        return null;
    }
}

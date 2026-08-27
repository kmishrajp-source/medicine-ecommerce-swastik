/**
 * Stock Alert Engine — Swastik Medicare
 *
 * Called after every stock deduction (online order OR counter sale).
 * If stock falls below threshold → sends SMS + WhatsApp to admin/pharmacist.
 */
import prisma from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { WhatsAppTriggers } from "@/lib/whatsapp";
import { MasterOrchestrator } from "@/lib/agents/MasterOrchestrator";

// ── Thresholds ─────────────────────────────────────────────────────────────────
export const STOCK_THRESHOLDS = {
    OUT_OF_STOCK: 0,
    CRITICAL: 5,    // send immediate alert
    LOW: 10,        // send warning
    WARNING: 20     // show on dashboard only (no SMS)
};

const ADMIN_PHONE = process.env.ADMIN_PHONE || "917992122974";

/**
 * Deduct stock from both Product and PharmacyInventory after a sale.
 * Then check and alert if low stock.
 *
 * @param {Array} items — [{ productId, quantity }]
 * @param {string} saleType — 'ONLINE_ORDER' | 'COUNTER_SALE'
 * @param {string} referenceId — orderId or counter sale ID
 */
export async function deductStockAndAlert(items, saleType = 'ONLINE_ORDER', referenceId = '') {
    const alertsTriggered = [];

    for (const { productId, quantity } of items) {
        try {
            const qty = parseInt(quantity);
            if (!qty || qty <= 0) continue;

            // 1. Deduct from Product.stock
            const updatedProduct = await prisma.product.update({
                where: { id: String(productId) },
                data: { stock: { decrement: qty } },
                select: { id: true, name: true, stock: true, category: true }
            });

            // 2. Deduct from PharmacyInventory.stock (operational mirror)
            await prisma.pharmacyInventory.updateMany({
                where: { productId: String(productId) },
                data: { stock: { decrement: qty } }
            });

            // 3. Log the sale in StockLog
            await prisma.stockLog.create({
                data: {
                    productId: String(productId),
                    quantity: -qty,  // negative = deduction
                    type: saleType,
                    buyingPrice: 0   // not applicable for sales
                }
            }).catch(() => {}); // non-blocking — don't fail if log fails

            // 4. Check low stock and alert
            const newStock = Math.max(0, updatedProduct.stock);
            const alert = await checkAndAlert(updatedProduct.name, String(productId), newStock, saleType, referenceId);
            if (alert) alertsTriggered.push(alert);

        } catch (err) {
            console.error(`[STOCK] Failed to deduct ${quantity} of ${productId}:`, err.message);
        }
    }

    return alertsTriggered;
}

/**
 * Check stock level and send SMS/WhatsApp if critical or out.
 */
async function checkAndAlert(medicineName, productId, currentStock, saleType, referenceId) {
    let level = null;
    let message = null;

    if (currentStock <= STOCK_THRESHOLDS.OUT_OF_STOCK) {
        level = 'OUT_OF_STOCK';
        message = `🚨 OUT OF STOCK: ${medicineName} is now ZERO units. Reorder IMMEDIATELY! (Ref: ${referenceId || saleType})`;
    } else if (currentStock <= STOCK_THRESHOLDS.CRITICAL) {
        level = 'CRITICAL';
        message = `⚠️ CRITICAL STOCK: ${medicineName} has only ${currentStock} units left. Please reorder soon. (Ref: ${referenceId || saleType})`;
    } else if (currentStock <= STOCK_THRESHOLDS.LOW) {
        level = 'LOW';
        message = `📦 LOW STOCK: ${medicineName} has ${currentStock} units. Consider restocking. (Swastik Medicare)`;
    }

    if (message && (level === 'OUT_OF_STOCK' || level === 'CRITICAL')) {
        // Send SMS to admin
        sendSMS(ADMIN_PHONE, `Swastik Medicare: ${message}`).catch(e =>
            console.error('[STOCK ALERT SMS]', e.message)
        );

        // Send WhatsApp to admin
        try {
            await WhatsAppTriggers.lowStockAlert?.('+91' + ADMIN_PHONE.replace(/^91/, ''), medicineName, currentStock, level);
        } catch (e) {
            console.error('[STOCK ALERT WA]', e.message);
        }

        // AGENTIC SYSTEM: Trigger Master Orchestrator to route to Supplier Intelligence
        try {
            await MasterOrchestrator.execute(
                `Product ${medicineName} (ID: ${productId}) is at ${level} stock (${currentStock} units). Please find suppliers and prepare a quotation recommendation.`,
                "SYSTEM_EVENT",
                { productId, level, currentStock }
            );
        } catch (e) {
            console.error('[STOCK ALERT AGENTIC ROUTING]', e.message);
        }
    }

    return level ? { productId, medicineName, currentStock, level } : null;
}

/**
 * Get full reorder list grouped by urgency level.
 * Returns medicines that need restocking, sorted by urgency.
 */
export async function getReorderList() {
    const items = await prisma.pharmacyInventory.findMany({
        where: { stock: { lte: STOCK_THRESHOLDS.WARNING } },
        include: {
            product: {
                select: {
                    id: true, name: true, category: true, brand: true,
                    buyingPrice: true, mrp: true, price: true,
                    manufacturer: true, batchNumber: true, expiryDate: true
                }
            }
        },
        orderBy: { stock: 'asc' }
    });

    const categorize = (stock) => {
        if (stock <= 0) return 'OUT_OF_STOCK';
        if (stock <= STOCK_THRESHOLDS.CRITICAL) return 'CRITICAL';
        if (stock <= STOCK_THRESHOLDS.LOW) return 'LOW';
        return 'WARNING';
    };

    // Suggested reorder: ensure at least 30 days stock (assume avg 2/day)
    const suggestQty = (stock) => Math.max(20, 60 - Math.max(0, stock));

    return items.map(inv => ({
        inventoryId: inv.id,
        productId: inv.productId,
        name: inv.product?.name || 'Unknown',
        category: inv.product?.category || '—',
        brand: inv.product?.brand || '—',
        manufacturer: inv.product?.manufacturer || '—',
        currentStock: inv.stock,
        lastBuyingPrice: inv.purchasePrice || inv.product?.buyingPrice || 0,
        mrp: inv.mrp || inv.product?.mrp || 0,
        sellingPrice: inv.sellingPrice || inv.product?.price || 0,
        urgency: categorize(inv.stock),
        suggestedOrderQty: suggestQty(inv.stock),
        estimatedCost: parseFloat(((inv.purchasePrice || inv.product?.buyingPrice || 0) * suggestQty(inv.stock)).toFixed(2))
    }));
}

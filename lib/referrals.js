"use server";
import prisma from "./prisma";
import { WhatsAppTriggers } from "./whatsapp";

/**
 * Process MLM Commissions (5% Direct, 2% Indirect) after a successful sale
 * 
 * @param {string} buyerId - The ID of the user who made the purchase
 * @param {string} orderId - The Order ID
 * @param {number} orderTotal - The total amount of the order
 */
export async function processMLMCommissions(buyerId, orderId, orderTotal) {
    if (!buyerId || orderTotal <= 0) return null;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Find the buyer to see who referred them
            const buyer = await tx.user.findUnique({ where: { id: buyerId } });
            if (!buyer || !buyer.referredBy) return null;

            // 2. Find Level 1 Referrer (Direct)
            const level1Referrer = await tx.user.findUnique({ where: { referralCode: buyer.referredBy } });
            if (!level1Referrer) return null;

            let level1Commission = 0;
            let level2Commission = 0;

            // Calculate 5% for Level 1
            level1Commission = parseFloat((orderTotal * 0.05).toFixed(2));

            // Pay Level 1
            await tx.user.update({
                where: { id: level1Referrer.id },
                data: { walletBalance: { increment: level1Commission } }
            });

            await tx.walletTransaction.create({
                data: {
                    userId: level1Referrer.id,
                    amount: level1Commission,
                    type: "CREDIT",
                    description: `5% Referral Commission from Order #${orderId.slice(-6)}`
                }
            });

            // 3. Find Level 2 Referrer (Indirect)
            let level2Referrer = null;
            if (level1Referrer.referredBy) {
                level2Referrer = await tx.user.findUnique({ where: { referralCode: level1Referrer.referredBy } });
                
                if (level2Referrer) {
                    // Calculate 2% for Level 2
                    level2Commission = parseFloat((orderTotal * 0.02).toFixed(2));

                    // Pay Level 2
                    await tx.user.update({
                        where: { id: level2Referrer.id },
                        data: { walletBalance: { increment: level2Commission } }
                    });

                    await tx.walletTransaction.create({
                        data: {
                            userId: level2Referrer.id,
                            amount: level2Commission,
                            type: "CREDIT",
                            description: `2% Indirect Referral Commission from Order #${orderId.slice(-6)}`
                        }
                    });
                }
            }

            return {
                success: true,
                level1: { id: level1Referrer.id, amount: level1Commission, phone: level1Referrer.phone },
                level2: level2Referrer ? { id: level2Referrer.id, amount: level2Commission, phone: level2Referrer.phone } : null
            };
        });

        // 4. Send WhatsApp Notifications (Outside the transaction)
        if (result && result.success) {
            // Check if level1 has phone and send notification
            if (result.level1.phone) {
                try {
                    await WhatsAppTriggers.referralBonusAlert(
                        result.level1.phone,
                        result.level1.amount,
                        "Direct Sale (5%)"
                    );
                } catch (e) { console.error("Level 1 WA error", e); }
            }

            if (result.level2 && result.level2.phone) {
                try {
                    await WhatsAppTriggers.referralBonusAlert(
                        result.level2.phone,
                        result.level2.amount,
                        "Indirect Sale (2%)"
                    );
                } catch (e) { console.error("Level 2 WA error", e); }
            }
        }

        return result;

    } catch (error) {
        console.error("MLM Commission Processing Error:", error);
        return null;
    }
}

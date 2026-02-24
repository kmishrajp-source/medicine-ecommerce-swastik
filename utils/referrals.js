import prisma from "@/lib/prisma";

/**
 * Processes Multi-Level Marketing (MLM) 2-Tier commissions.
 * Calculates margin (20% of order total) and awards:
 * Level 1: 5% of margin
 * Level 2: 2% of margin
 */
export async function processReferralCommissions(userId, orderTotal) {
    if (!userId || orderTotal <= 0) return false;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, referredBy: true, name: true }
        });

        // If the user wasn't referred by anyone, stop here.
        if (!user || !user.referredBy) return false;

        // Find Level 1 Referrer
        const level1Referrer = await prisma.user.findUnique({
            where: { referralCode: user.referredBy }
        });

        if (!level1Referrer) return false;

        // Calculate commissions based on a 20% assumed medicine gross margin
        const estimatedMargin = orderTotal * 0.20;

        // Let's cap minimums to prevent sub-penny fractions
        const level1Amount = Math.max(0.01, parseFloat((estimatedMargin * 0.05).toFixed(2))); // 5% of margin
        const level2Amount = Math.max(0.01, parseFloat((estimatedMargin * 0.02).toFixed(2))); // 2% of margin

        // 1. Award Level 1 Commission
        await prisma.user.update({
            where: { id: level1Referrer.id },
            data: { walletBalance: { increment: level1Amount } }
        });

        await prisma.walletTransaction.create({
            data: {
                userId: level1Referrer.id,
                amount: level1Amount,
                type: "CREDIT",
                description: `Level 1 Commission (5% of Margin) from ${user.name || "Referred User"}'s Order.`
            }
        });

        console.log(`[REFERRAL] Awarded ₹${level1Amount} L1 Commission to ${level1Referrer.email}`);

        // 2. Check for Level 2 Referrer (The person who referred the Level 1 referrer)
        if (level1Referrer.referredBy) {
            const level2Referrer = await prisma.user.findUnique({
                where: { referralCode: level1Referrer.referredBy }
            });

            if (level2Referrer) {
                // Award Level 2 Commission
                await prisma.user.update({
                    where: { id: level2Referrer.id },
                    data: { walletBalance: { increment: level2Amount } }
                });

                await prisma.walletTransaction.create({
                    data: {
                        userId: level2Referrer.id,
                        amount: level2Amount,
                        type: "CREDIT",
                        description: `Level 2 Commission (2% of Margin) from Extended Network Order.`
                    }
                });

                console.log(`[REFERRAL] Awarded ₹${level2Amount} L2 Commission to ${level2Referrer.email}`);
            }
        }

        return true;
    } catch (error) {
        console.error("[REFERRAL EXCEPTION] Failed to process commissions:", error);
        return false;
    }
}

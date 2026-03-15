"use server";
import prisma from "./prisma";

/**
 * Process a Referral Bonus when a new user registers using a code
 * OR when a new user makes their first purchase.
 * 
 * @param {string} newUserId - The ID of the newly registered user
 * @param {string} referralCodeUsed - The code they entered (e.g., SW-A1B2C)
 */
export async function processReferralSignup(newUserId, referralCodeUsed) {
    if (!referralCodeUsed || !newUserId) return;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Find the referrer
            const referrer = await tx.user.findFirst({
                where: { referralCode: referralCodeUsed }
            });

            if (!referrer || referrer.id === newUserId) {
                console.log("Referral Code invalid or self-referred");
                return null;
            }

            // 2. Prevent Abuse (Check if this newUser was already referred)
            const newUser = await tx.user.findUnique({ where: { id: newUserId }});
            if (newUser.referredById) return null; // Already processed

            // 3. Get dynamic bonus amounts from SystemSettings (or fallback)
            let settings = await tx.systemSettings.findUnique({ where: { id: 'default' }});
            const referrerBonus = settings?.referralBonusAmount || 50.0;
            const welcomeBonus = settings?.welcomeBonusAmount || 50.0;

            // 4. Update the New User (Link Referrer & Add Welcome Bonus)
            await tx.user.update({
                where: { id: newUserId },
                data: {
                    referredById: referrer.id,
                    walletBalance: { increment: welcomeBonus }
                }
            });

            // Log New User Welcome Bonus
            await tx.walletTransaction.create({
                data: {
                    userId: newUserId,
                    amount: welcomeBonus,
                    type: "CREDIT",
                    description: `Welcome Bonus (Used code: ${referralCodeUsed})`
                }
            });

            // 5. Update the Referrer (Add Referral Bonus)
            await tx.user.update({
                where: { id: referrer.id },
                data: { walletBalance: { increment: referrerBonus } }
            });

            // Log Referrer Bonus
            await tx.walletTransaction.create({
                data: {
                    userId: referrer.id,
                    amount: referrerBonus,
                    type: "CREDIT",
                    description: `Referral Bonus (Invited new user)`
                }
            });

            return { success: true, referrerId: referrer.id };
        });

        return result;

    } catch (error) {
        console.error("Referral Processing Error:", error);
        // We do not throw because referral failure shouldn't crash the main signup flow
        return null;
    }
}

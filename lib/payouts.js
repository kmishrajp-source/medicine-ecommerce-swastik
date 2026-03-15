import prisma from "./prisma";

// Centralized Commission Settings
const PLATFORM_COMMISSION_RATE = 0.10; // 10%

/**
 * Process a payout to a provider (Doctor, Lab, Ambulance, Retailer)
 * This automatically deducts the 10% platform commission and adds the 90%
 * remainder to the provider's wallet balance.
 * 
 * @param {string} userId - The user ID of the provider receiving the funds
 * @param {number} totalAmount - The total amount collected from the patient/customer
 * @param {string} description - The description of the service (e.g. "Consultation Booking #123")
 * @returns {object} - The completed wallet transaction record
 */
export async function processProviderPayout(userId, totalAmount, description) {
    if (!userId || !totalAmount || totalAmount <= 0) {
        throw new Error("Invalid payout parameters");
    }

    // 1. Calculate the split
    const platformCommission = totalAmount * PLATFORM_COMMISSION_RATE;
    const providerEarnings = totalAmount - platformCommission;

    // 2. Perform the database transaction atomically
    const transaction = await prisma.$transaction(async (tx) => {
        // Find existing user to ensure wallet exists
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("Provider user not found");

        // Credit 90% to the Provider's Wallet
        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: { walletBalance: { increment: providerEarnings } }
        });

        // Record the transaction on the provider's ledger
        const walletLog = await tx.walletTransaction.create({
            data: {
                userId: userId,
                amount: providerEarnings,
                type: "CREDIT",
                description: `Earnings (90%): ${description}`
            }
        });

        // Log the 10% platform commission for admin tracking (pseudo-ledger)
        // We link this to the SYSTEM / ADMIN user implicitly, or just log the deduction 
        // on the provider's history so they see the math.
        await tx.walletTransaction.create({
             data: {
                 userId: userId,
                 amount: -platformCommission,
                 type: "DEBIT",
                 description: `Platform Commission (10%): ${description}`
             }
        });

        return { user: updatedUser, log: walletLog, commission: platformCommission };
    });

    return transaction;
}

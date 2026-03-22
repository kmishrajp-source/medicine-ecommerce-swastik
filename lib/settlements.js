import prisma from "./prisma";

/**
 * Settles payments for partners by deducting 10% commission and crediting 90% to their wallet.
 * @param {Object} params - { type: 'APPOINTMENT' | 'PRODUCT', id: string, amount: number, partnerId: string, partnerType: 'HOSPITAL' | 'MANUFACTURER' }
 */
export async function settlePartnerPayment({ type, id, amount, partnerId, partnerType }) {
    try {
        const commission = amount * 0.10;
        const payout = amount - commission;

        // 1. Log the Commission for Admin Reports
        await prisma.systemHealthLog.create({
            data: {
                component: "FINANCE_CORE",
                issueType: "PLATFORM_COMMISSION",
                severity: "INFO",
                message: `10% Commission (₹${commission}) collected from ${partnerType} for ${type} ${id}`,
                details: { type, id, partnerId, amount, commission, payout }
            }
        });

        // 2. Credit Partner Wallet (Simulated via SystemHealthLog for now as per current structure, 
        // but ideally would use a real Wallet model if available)
        // Check if user has a wallet or role-based account
        const partner = await prisma.user.findFirst({
            where: { 
                OR: [
                    { hospitalProfile: { id: partnerId } },
                    { manufacturerProfile: { id: partnerId } }
                ]
            }
        });

        if (partner && partner.phone) {
            // 3. Trigger WhatsApp Notification to Partner
            const { WhatsAppTriggers } = require("./whatsapp");
            await WhatsAppTriggers.partnerSettlementAlert(partner.phone, partnerType, payout, id);
            
            console.log(`Credited ₹${payout} to ${partnerType} ${partnerId} (User: ${partner.id}). WhatsApp Sent.`);
        }

        return { success: true, commission, payout };
    } catch (error) {
        console.error("Settlement Error:", error);
        
        // Log Failure for AI Monitoring
        await prisma.systemFailureLog.create({
            data: {
                actionType: "payment_settlement",
                userRole: partnerType.toLowerCase(),
                errorType: "finance",
                errorMessage: `Settlement failed for ${type} ${id}: ${error.message}`,
                details: { partnerId, amount, error: error.stack }
            }
        });

        return { success: false, error: error.message };
    }
}

import prisma from './prisma';

/**
 * Calculates and distributes commission for a lead booking.
 * @param {string} leadId - The ID of the lead being booked.
 * @param {number} amount - The total amount paid in paise.
 */
export async function distributeLeadCommission(leadId, amount) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId }
  });

  if (!lead || !lead.publisherId) return;

  // Amount is in paise, walletBalance is in Float (INR)
  const publisherShare = (amount * 0.8) / 100;
  const adminShare = (amount - (amount * 0.8)) / 100;

  await prisma.$transaction([
    // Update Publisher WalletBalance on User
    prisma.user.update({
      where: { id: lead.publisherId },
      data: { walletBalance: { increment: publisherShare } }
    }),
    // Create Transaction for Publisher
    prisma.walletTransaction.create({
      data: {
        userId: lead.publisherId,
        amount: publisherShare,
        type: 'CREDIT',
        description: `Commission for lead booking: ${leadId}`
      }
    }),
    // Create Transaction for Platform (optional, if tracking admin fees separately)
    prisma.walletTransaction.create({
      data: {
        userId: 'admin', // Ensure a user with ID 'admin' exists or use a real admin ID
        amount: adminShare,
        type: 'CREDIT',
        description: `Platform fee for lead booking: ${leadId}`
      }
    })
  ]);
}

/**
 * Processes a contact unlock payment.
 * @param {string} userId - The ID of the user who paid.
 * @param {string} targetId - The ID of the entity being unlocked (doctor, hospital, retailer).
 * @param {string} targetType - The type of entity.
 */
export async function processContactUnlock(userId, targetId, targetType) {
  await prisma.$transaction([
    prisma.contactUnlock.create({
      data: {
        userId,
        targetId,
        targetType,
        amount: 0 // Amount is handled in payment gateway
      }
    }),
    prisma.walletTransaction.create({
      data: {
        userId,
        amount: 0, 
        type: 'DEBIT',
        description: `Unlocked contact for ${targetType}: ${targetId}`
      }
    })
  ]);
}

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

  // Amount is in INR, 10% commission
  const publisherShare = parseFloat(amount) * 0.1;
  const adminShare = parseFloat(amount) * 0.05; // 5% platform fee

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

 * Processes a contact unlock payment.
 * @param {string} userId - The ID of the user who paid.
 * @param {string} targetId - The ID of the entity being unlocked (doctor, hospital, retailer).
 * @param {string} targetType - The type of entity.
 * @param {string} paymentId - The Razorpay payment ID.
 */
export async function processContactUnlock(userId, targetId, targetType, paymentId) {
  await prisma.$transaction([
    prisma.contactUnlock.create({
      data: {
        userId,
        targetId,
        targetType,
        amount: 0, // Placeholder
        paymentId
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

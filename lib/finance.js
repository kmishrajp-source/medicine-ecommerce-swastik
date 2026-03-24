import { prisma } from './prisma';

/**
 * Calculates and distributes commission for a lead booking.
 * @param {string} leadId - The ID of the lead being booked.
 * @param {number} amount - The total amount paid in paise.
 */
export async function distributeLeadCommission(leadId, amount) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { publisher: true }
  });

  if (!lead || !lead.publisherId) return;

  // Example Logic: 80% to Publisher, 20% to Platform (Admin)
  const publisherShare = Math.floor(amount * 0.8);
  const adminShare = amount - publisherShare;

  await prisma.$transaction([
    // Update Publisher Wallet
    prisma.wallet.upsert({
      where: { userId: lead.publisherId },
      update: { balance: { increment: publisherShare } },
      create: { userId: lead.publisherId, balance: publisherShare }
    }),
    // Create Transaction for Publisher
    prisma.transaction.create({
      data: {
        userId: lead.publisherId,
        amount: publisherShare,
        type: 'EARNING',
        status: 'COMPLETED',
        description: `Commission for lead booking: ${leadId}`
      }
    }),
    // Create Transaction for Platform (optional, if tracking admin fees separately)
    prisma.transaction.create({
      data: {
        userId: 'admin', // Placeholder or system user
        amount: adminShare,
        type: 'COMMISSION',
        status: 'COMPLETED',
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
        targetType
      }
    }),
    prisma.transaction.create({
      data: {
        userId,
        amount: 0, // Recorded in Razorpay, but can store here if needed
        type: 'PAYMENT',
        status: 'COMPLETED',
        description: `Unlocked contact for ${targetType}: ${targetId}`
      }
    })
  ]);
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Calculate Tier based on lifetime points
const calculateTier = (totalEarned) => {
  if (totalEarned >= 10000) return 'Platinum';
  if (totalEarned >= 5000) return 'Gold';
  if (totalEarned >= 1000) return 'Silver';
  return 'Bronze';
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    const ledgers = await prisma.basLoyaltyAccount.findMany({
      where: {
        ...(customerId && { customerId })
      },
      orderBy: { pointsBalance: 'desc' },
      take: 100
    });

    return NextResponse.json(ledgers);
  } catch (error) {
    console.error('Error fetching loyalty accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { customerId, pointsToAdd, pointsToDeduct, cashbackToAdd } = data;

    if (!customerId) return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });

    // Fetch or create account
    let account = await prisma.basLoyaltyAccount.findUnique({ where: { customerId } });
    
    if (!account) {
      account = await prisma.basLoyaltyAccount.create({
        data: { customerId, tier: 'Bronze', pointsBalance: 0, cashbackValue: 0, totalEarned: 0, totalRedeemed: 0 }
      });
    }

    // Process adjustments
    const newEarned = account.totalEarned + (pointsToAdd || 0);
    const newBalance = account.pointsBalance + (pointsToAdd || 0) - (pointsToDeduct || 0);
    const newRedeemed = account.totalRedeemed + (pointsToDeduct || 0);
    const newCashback = account.cashbackValue + (cashbackToAdd || 0);
    const newTier = calculateTier(newEarned);

    if (newBalance < 0) return NextResponse.json({ error: 'Insufficient points balance' }, { status: 400 });

    const updated = await prisma.basLoyaltyAccount.update({
      where: { id: account.id },
      data: {
        pointsBalance: newBalance,
        totalEarned: newEarned,
        totalRedeemed: newRedeemed,
        cashbackValue: newCashback,
        tier: newTier
      }
    });

    // Also sync the mirror points on BasCustomerProfile
    await prisma.basCustomerProfile.update({
      where: { userId: customerId },
      data: { loyaltyPoints: newBalance }
    }).catch(() => {}); // Catch if profile doesn't exist yet

    // Log the transaction
    await prisma.basAuditLog.create({
      data: {
        action: 'LOYALTY_ADJUSTMENT',
        entityType: 'CRM_LOYALTY',
        entityId: account.id,
        newValue: JSON.stringify({ added: pointsToAdd, deducted: pointsToDeduct, newBalance }),
        ipAddress: request.headers.get('x-forwarded-for') || 'Unknown'
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating loyalty account:', error);
    return NextResponse.json({ error: 'Failed to update loyalty account' }, { status: 500 });
  }
}

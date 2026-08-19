import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Default to last 30 days if not provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const transactions = await prisma.revenueTransaction.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Aggregations
    const aggregated = transactions.reduce(
      (acc, curr) => {
        acc.totalNetRevenue += curr.netRevenue;
        acc.totalCustomerPaid += curr.customerPaid;
        acc.totalGrossMargin += curr.grossMargin;
        
        // Group by type
        if (!acc.byType[curr.transactionType]) {
          acc.byType[curr.transactionType] = 0;
        }
        acc.byType[curr.transactionType] += curr.netRevenue;

        return acc;
      },
      { totalNetRevenue: 0, totalCustomerPaid: 0, totalGrossMargin: 0, byType: {} }
    );

    return NextResponse.json({
      success: true,
      period: { start, end },
      aggregated,
      transactions,
    });
  } catch (error) {
    console.error('Error in Revenue Engine API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Create a new manual or programmatic revenue transaction
    const transaction = await prisma.revenueTransaction.create({
      data: {
        transactionType: data.transactionType,
        referenceId: data.referenceId,
        userId: data.userId || null,
        providerId: data.providerId || null,
        customerPaid: parseFloat(data.customerPaid || 0),
        providerPayout: parseFloat(data.providerPayout || 0),
        platformFee: parseFloat(data.platformFee || 0),
        commission: parseFloat(data.commission || 0),
        deliveryCost: parseFloat(data.deliveryCost || 0),
        paymentCost: parseFloat(data.paymentCost || 0),
        discounts: parseFloat(data.discounts || 0),
        netRevenue: parseFloat(data.netRevenue || 0),
        grossMargin: parseFloat(data.grossMargin || 0),
        status: data.status || 'COMPLETED',
      },
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error('Error creating Revenue Transaction:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // We aggregate basic metrics here for the dashboard.
    // In a production scenario with millions of rows, we might cache this or use a data warehouse.
    
    // 1. Sales & Revenue KPIs (from existing Order table)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalOrders = await prisma.order.count();
    const todayOrders = await prisma.order.count({
      where: { createdAt: { gte: today } }
    });
    
    // Sum of all delivered orders revenue
    const revenueAgg = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: 'Delivered' }
    });

    // 2. Marketing & CRM KPIs
    const totalLeads = await prisma.basCrmLead.count();
    const activeCampaigns = await prisma.basCampaign.count({
      where: { status: 'ACTIVE' }
    });

    const metrics = {
      sales: {
        totalOrders,
        todayOrders,
        revenue: revenueAgg._sum.total || 0,
      },
      marketing: {
        totalLeads,
        activeCampaigns,
      },
      operations: {
        // Placeholder for phase 4
        pendingDispatches: 0
      }
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return NextResponse.json({ error: 'Failed to fetch KPIs' }, { status: 500 });
  }
}

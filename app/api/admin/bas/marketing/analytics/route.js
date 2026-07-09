import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // Determine timeframe. Default to current month.
    const today = new Date();
    today.setHours(0,0,0,0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Fetch Funnel Metrics
    // Simulated Visitors (Usually 10x the Leads)
    const newLeads = await prisma.basCrmLead.count({ where: { createdAt: { gte: firstDayOfMonth } } });
    const simulatedVisitors = newLeads > 0 ? newLeads * 14 : 1250; // Dynamic mock

    // New Customers (Registered Users this month)
    const newCustomers = await prisma.user.count({ where: { createdAt: { gte: firstDayOfMonth } } });

    // Returning Customers (Orders placed by users who have ordered before)
    // We'll estimate this by looking at unique user IDs ordering this month vs total users
    const ordersThisMonth = await prisma.order.findMany({
      where: { createdAt: { gte: firstDayOfMonth } },
      select: { userId: true, total: true }
    });

    const uniqueBuyers = new Set(ordersThisMonth.filter(o => o.userId).map(o => o.userId));
    // Simulated returning customers (Buyers who are not 'New Customers')
    const returningCustomers = Math.max(0, uniqueBuyers.size - (newCustomers * 0.1));

    // 2. Fetch Advertising Spend & Revenue
    const campaigns = await prisma.basMarketingCampaign.findMany({
      where: {
        status: 'ACTIVE',
        type: 'AD'
      }
    });

    const totalAdSpend = campaigns.reduce((sum, camp) => sum + camp.spend, 0);
    
    // Total Revenue (From Orders)
    const totalRevenue = ordersThisMonth.reduce((sum, order) => sum + order.total, 0);
    
    // Simulated Profit (Assuming 30% margin)
    const grossProfit = totalRevenue * 0.3;

    // ROI = (Gross Profit - Ad Spend) / Ad Spend
    const roiPercentage = totalAdSpend > 0 ? ((grossProfit - totalAdSpend) / totalAdSpend) * 100 : 0;

    // 3. Fetch Automations
    const automations = await prisma.basMarketingAutomation.findMany();

    return NextResponse.json({
      funnel: {
        visitors: simulatedVisitors,
        leads: newLeads,
        newCustomers,
        returningCustomers
      },
      financials: {
        adSpend: totalAdSpend,
        revenue: totalRevenue,
        profit: grossProfit,
        roi: roiPercentage
      },
      campaigns,
      automations
    });
  } catch (error) {
    console.error('Error fetching marketing analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch marketing data' }, { status: 500 });
  }
}

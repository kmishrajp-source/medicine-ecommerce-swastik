import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Unified Admin BI Control Center - Aggregation API
 * GET /api/admin/bi-control-center
 * 
 * Fetches cross-platform KPIs for the executive dashboard.
 */

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // ── REVENUE & ORDERS ──────────────────────────────────────────
    const [totalOrders, todayOrders, deliveredOrders, pendingOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.count({ where: { status: 'Delivered' } }),
      prisma.order.count({ where: { status: { in: ['Received', 'Rx_Uploaded', 'Pharmacist_Approved', 'Ready_for_Packing'] } } }),
    ]);

    const revenueAgg = await prisma.order.aggregate({
      _sum: { total: true },
      where: { isPaid: true },
    });
    const totalRevenue = revenueAgg._sum.total || 0;

    const monthRevenueAgg = await prisma.order.aggregate({
      _sum: { total: true },
      where: { isPaid: true, createdAt: { gte: monthStart } },
    });
    const monthRevenue = monthRevenueAgg._sum.total || 0;

    // ── B2B MARKETPLACE ───────────────────────────────────────────
    let b2bRfqCount = 0;
    let b2bActiveRetailers = 0;
    try {
      b2bRfqCount = await prisma.bulkOrder.count();
      b2bActiveRetailers = await prisma.retailer.count({ where: { verified: true } });
    } catch (e) { /* Models may not exist yet */ }

    // ── LOGISTICS ─────────────────────────────────────────────────
    let activeRiders = 0;
    let totalDeliveryJobs = 0;
    let completedDeliveryJobs = 0;
    try {
      activeRiders = await prisma.deliveryAgent.count({ where: { isOnline: true } });
      totalDeliveryJobs = await prisma.deliveryJob.count();
      completedDeliveryJobs = await prisma.deliveryJob.count({ where: { status: 'DELIVERED' } });
    } catch (e) { /* Models may not exist yet */ }

    // ── BIOINFORMATICS ────────────────────────────────────────────
    let totalDatasets = 0;
    let processedDatasets = 0;
    let activeJobs = 0;
    try {
      totalDatasets = await prisma.genomicDataset.count();
      processedDatasets = await prisma.genomicDataset.count({ where: { status: 'PROCESSED' } });
      activeJobs = await prisma.bioinformaticsJob.count({ where: { progress: { lt: 100 } } });
    } catch (e) { /* Models may not exist yet */ }

    // ── USERS & GROWTH ────────────────────────────────────────────
    const totalUsers = await prisma.user.count();
    const newUsersToday = await prisma.user.count({ where: { createdAt: { gte: todayStart } } });
    const newUsersMonth = await prisma.user.count({ where: { createdAt: { gte: monthStart } } });

    // ── PRESCRIPTIONS ─────────────────────────────────────────────
    const pendingRx = await prisma.prescription.count({ where: { status: 'Pending' } });

    // ── AMBULANCE ─────────────────────────────────────────────────
    let activeAmbulances = 0;
    try {
      activeAmbulances = await prisma.ambulance.count({ where: { isAvailable: true } });
    } catch (e) { /* */ }

    // ── COMPLAINTS ────────────────────────────────────────────────
    let openComplaints = 0;
    try {
      openComplaints = await prisma.complaint.count({ where: { status: 'Open' } });
    } catch (e) { /* */ }

    // ── RECENT ACTIVITY FEED (last 10 events) ─────────────────────
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, status: true, total: true, createdAt: true, user: { select: { name: true } } },
    });

    let recentDatasets = [];
    try {
      recentDatasets = await prisma.genomicDataset.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, fileName: true, status: true, createdAt: true },
      });
    } catch (e) { /* */ }

    const activityFeed = [
      ...recentOrders.map(o => ({
        type: 'ORDER',
        icon: '🛒',
        message: `Order #${o.id.slice(-6)} — ₹${o.total} — ${o.status}`,
        user: o.user?.name || 'Guest',
        time: o.createdAt,
      })),
      ...recentDatasets.map(d => ({
        type: 'BIO',
        icon: '🧬',
        message: `Dataset "${d.fileName}" — ${d.status}`,
        user: 'System',
        time: d.createdAt,
      })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

    // ── SYSTEM HEALTH ─────────────────────────────────────────────
    const systemHealth = {
      ecommerce: { status: 'GREEN', label: 'Core E-Commerce' },
      logistics: { status: activeRiders > 0 ? 'GREEN' : 'YELLOW', label: 'Logistics Engine' },
      bioinformatics: { status: activeJobs > 3 ? 'YELLOW' : 'GREEN', label: 'Genomics Pipeline' },
      b2b: { status: 'GREEN', label: 'B2B Marketplace' },
      ai: { status: 'GREEN', label: 'AI Orchestrator' },
    };

    return NextResponse.json({
      success: true,
      data: {
        revenue: { totalRevenue, monthRevenue, totalOrders, todayOrders, deliveredOrders, pendingOrders },
        b2b: { rfqCount: b2bRfqCount, activeRetailers: b2bActiveRetailers },
        logistics: { activeRiders, totalDeliveryJobs, completedDeliveryJobs, deliveryRate: totalDeliveryJobs > 0 ? Math.round((completedDeliveryJobs / totalDeliveryJobs) * 100) : 0 },
        bioinformatics: { totalDatasets, processedDatasets, activeJobs },
        users: { totalUsers, newUsersToday, newUsersMonth },
        operations: { pendingRx, activeAmbulances, openComplaints },
        activityFeed,
        systemHealth,
      },
    });

  } catch (error) {
    console.error('BI Control Center Error:', error);
    return NextResponse.json({ error: 'Failed to aggregate BI data' }, { status: 500 });
  }
}

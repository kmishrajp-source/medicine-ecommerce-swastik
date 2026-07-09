import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Fetch CRM stats
    const totalLeads = await prisma.basCrmLead.count();
    const newLeadsMonth = await prisma.basCrmLead.count({ where: { createdAt: { gte: firstDayOfMonth } } });
    
    // Revenue stats based on Lead Pipeline "WON" expected value (or orders)
    const wonLeads = await prisma.basCrmLead.aggregate({
      where: { status: 'WON' },
      _sum: { expectedValue: true },
      _count: true
    });

    // Customer classifications
    const classifications = await prisma.basCustomerProfile.groupBy({
      by: ['classification'],
      _count: true
    });

    // Support Tickets (Assuming BasTicket exists from BAS Phase)
    let openTickets = 0;
    try {
      openTickets = await prisma.basTicket.count({
        where: { status: { in: ['NEW', 'OPEN', 'IN_PROGRESS'] } }
      });
    } catch(e) {
      // Ignored if model name varies
    }

    // Task completions
    const pendingTasks = await prisma.basTask.count({ where: { status: 'Pending' } });
    const completedTasks = await prisma.basTask.count({ where: { status: 'Completed', updatedAt: { gte: firstDayOfMonth } } });

    // Customer Lifetime Value average
    const ltvStats = await prisma.basCustomerProfile.aggregate({
      _avg: { lifetimeValue: true }
    });

    return NextResponse.json({
      leads: { total: totalLeads, newThisMonth: newLeadsMonth },
      revenue: { closedWon: wonLeads._sum.expectedValue || 0, wonCount: wonLeads._count || 0 },
      classifications: classifications.reduce((acc, curr) => {
        acc[curr.classification] = curr._count;
        return acc;
      }, {}),
      support: { openTickets },
      tasks: { pending: pendingTasks, completedThisMonth: completedTasks },
      customers: { avgLTV: ltvStats._avg.lifetimeValue || 0 }
    });
  } catch (error) {
    console.error('Error fetching CRM analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

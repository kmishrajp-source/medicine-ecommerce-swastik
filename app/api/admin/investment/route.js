import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deployments = await prisma.capitalDeployment.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });

    const summary = deployments.reduce((acc, curr) => {
      acc.totalApproved += curr.approvedBudget;
      acc.totalCommitted += curr.committedCapital;
      acc.totalSpent += curr.spentCapital;
      return acc;
    }, { totalApproved: 0, totalCommitted: 0, totalSpent: 0 });

    return NextResponse.json({ success: true, deployments, summary });
  } catch (error) {
    console.error('Error fetching investments:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const deployment = await prisma.capitalDeployment.create({
      data: {
        milestoneStage: data.milestoneStage || 'STAGE_1',
        category: data.category || 'TECHNOLOGY',
        approvedBudget: parseFloat(data.approvedBudget || 0),
        committedCapital: parseFloat(data.committedCapital || 0),
        spentCapital: parseFloat(data.spentCapital || 0),
        status: data.status || 'PLANNED',
      },
    });

    return NextResponse.json({ success: true, deployment });
  } catch (error) {
    console.error('Error creating capital deployment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

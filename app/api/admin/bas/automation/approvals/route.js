import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all approval requests
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const approvals = await prisma.basApprovalRequest.findMany({
      where: status ? { status } : undefined,
      include: {
        approvalLevels: { orderBy: { level: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(approvals);
  } catch (error) {
    console.error('Error fetching approval requests:', error);
    return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 });
  }
}

// POST create a new approval request
export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.workflowType || !data.requestedById || !data.title) {
      return NextResponse.json({ error: 'workflowType, requestedById, and title are required' }, { status: 400 });
    }

    const approval = await prisma.basApprovalRequest.create({
      data: {
        workflowType: data.workflowType,
        requestedById: data.requestedById,
        title: data.title,
        description: data.description,
        amount: data.amount ? parseFloat(data.amount) : null,
        referenceId: data.referenceId,
        approvalLevels: data.approvers
          ? {
              create: data.approvers.map((approverId, i) => ({
                level: i + 1,
                approverId,
              })),
            }
          : undefined,
      },
      include: { approvalLevels: true },
    });

    // Auto-create notification for the first approver
    if (approval.approvalLevels.length > 0) {
      const firstApprover = approval.approvalLevels[0];
      await prisma.basNotification.create({
        data: {
          userId: firstApprover.approverId,
          channel: 'INTERNAL',
          title: `Approval Required: ${data.title}`,
          body: `You have a new approval request pending your review.`,
          referenceId: approval.id,
          referenceType: 'APPROVAL',
        },
      }).catch(err => console.error('Notification failed:', err));
    }

    return NextResponse.json(approval, { status: 201 });
  } catch (error) {
    console.error('Error creating approval:', error);
    return NextResponse.json({ error: 'Failed to create approval request' }, { status: 500 });
  }
}

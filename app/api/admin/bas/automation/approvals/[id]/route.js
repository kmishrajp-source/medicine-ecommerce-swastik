import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PATCH - approve or reject a specific approval level
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    const { action, approverId, notes } = data; // action: 'APPROVED' | 'REJECTED'

    if (!action || !approverId) {
      return NextResponse.json({ error: 'action and approverId are required' }, { status: 400 });
    }

    const approvalRequest = await prisma.basApprovalRequest.findUnique({
      where: { id },
      include: { approvalLevels: { orderBy: { level: 'asc' } } },
    });

    if (!approvalRequest) {
      return NextResponse.json({ error: 'Approval request not found' }, { status: 404 });
    }

    // Find the current pending level that belongs to this approver
    const currentLevelEntry = approvalRequest.approvalLevels.find(
      l => l.approverId === approverId && l.status === 'PENDING'
    );

    if (!currentLevelEntry) {
      return NextResponse.json({ error: 'No pending approval level found for this approver' }, { status: 400 });
    }

    // Update this level
    await prisma.basApprovalLevel.update({
      where: { id: currentLevelEntry.id },
      data: { status: action, notes, decidedAt: new Date() },
    });

    // If rejected — close the whole request
    if (action === 'REJECTED') {
      await prisma.basApprovalRequest.update({
        where: { id },
        data: { status: 'REJECTED' },
      });
      return NextResponse.json({ message: 'Approval request rejected' });
    }

    // If approved — check if there's a next level
    const nextLevel = approvalRequest.approvalLevels.find(
      l => l.level === currentLevelEntry.level + 1
    );

    if (nextLevel) {
      // Escalate to next level — notify next approver
      await prisma.basApprovalRequest.update({
        where: { id },
        data: { currentLevel: nextLevel.level },
      });
      await prisma.basNotification.create({
        data: {
          userId: nextLevel.approverId,
          channel: 'INTERNAL',
          title: `Approval Required: ${approvalRequest.title}`,
          body: `This request has been approved at Level ${currentLevelEntry.level} and now requires your review.`,
          referenceId: id,
          referenceType: 'APPROVAL',
        },
      }).catch(err => console.error('Notification error:', err));
      return NextResponse.json({ message: `Escalated to Level ${nextLevel.level}` });
    }

    // All levels approved — complete the request
    await prisma.basApprovalRequest.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
    return NextResponse.json({ message: 'Approval request fully approved' });
  } catch (error) {
    console.error('Error updating approval:', error);
    return NextResponse.json({ error: 'Failed to update approval' }, { status: 500 });
  }
}

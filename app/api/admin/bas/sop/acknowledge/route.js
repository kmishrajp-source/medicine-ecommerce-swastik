import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const data = await request.json();
    const { sopDocumentId, employeeId } = data;

    if (!sopDocumentId || !employeeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const acknowledgement = await prisma.basSopAcknowledgement.upsert({
      where: {
        sopDocumentId_employeeId: {
          sopDocumentId,
          employeeId,
        },
      },
      update: {
        acknowledgedAt: new Date(),
      },
      create: {
        sopDocumentId,
        employeeId,
      },
    });

    // Write audit log
    await prisma.basAuditLog.create({
      data: {
        actionType: 'ACKNOWLEDGE_SOP',
        module: 'SOP',
        targetId: sopDocumentId,
        newValue: JSON.parse(JSON.stringify(acknowledgement)),
      },
    }).catch(err => console.error('Failed to log SOP acknowledgement:', err));

    return NextResponse.json(acknowledgement, { status: 201 });
  } catch (error) {
    console.error('Error acknowledging SOP:', error);
    return NextResponse.json({ error: 'Failed to acknowledge SOP' }, { status: 500 });
  }
}

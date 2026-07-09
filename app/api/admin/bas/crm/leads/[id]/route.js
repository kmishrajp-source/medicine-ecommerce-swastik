import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PATCH - Update lead pipeline status and probability
export async function PATCH(request, { params }) {
  try {
    // Await params per Next.js 15 routing rules
    const p = await params;
    const { id } = p;
    const data = await request.json();
    const { status, probability, assignedToId } = data;

    const oldLead = await prisma.basCrmLead.findUnique({ where: { id } });
    if (!oldLead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    const updatedLead = await prisma.basCrmLead.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(probability !== undefined && { probability }),
        ...(assignedToId !== undefined && { assignedToId })
      }
    });

    // Audit log
    await prisma.basAuditLog.create({
      data: {
        action: 'UPDATE_LEAD_PIPELINE',
        entityType: 'CRM_LEAD',
        entityId: id,
        oldValue: JSON.stringify({ status: oldLead.status, probability: oldLead.probability }),
        newValue: JSON.stringify({ status: updatedLead.status, probability: updatedLead.probability }),
        ipAddress: request.headers.get('x-forwarded-for') || 'Unknown'
      }
    }).catch(err => console.error("Audit log failed", err));

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const leads = await prisma.basCrmLead.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        interactions: {
          orderBy: { date: 'desc' },
          take: 1
        }
      }
    });
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching CRM leads:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    if (!data.customerName || !data.source) {
      return NextResponse.json({ error: 'Customer name and source are required' }, { status: 400 });
    }

    const newLead = await prisma.basCrmLead.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        source: data.source,
        status: 'NEW',
        leadScore: 10,
        expectedValue: data.expectedValue || 0,
      }
    });

    // Log the action (Audit Trail)
    await prisma.basAuditLog.create({
      data: {
        actionType: 'CREATE_LEAD',
        module: 'CRM',
        targetId: newLead.id,
        newValue: newLead
      }
    }).catch(err => console.error("Failed to write audit log", err));

    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error('Error creating CRM lead:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}

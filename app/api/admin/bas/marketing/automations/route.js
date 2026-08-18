import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST create a new automation rule
export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.name || !data.triggerEvent) {
      return NextResponse.json({ error: 'Name and triggerEvent are required' }, { status: 400 });
    }
    const automation = await prisma.basMarketingAutomation.create({
      data: {
        name: data.name,
        triggerEvent: data.triggerEvent,
        actionType: data.actionType || 'SEND_WHATSAPP',
        delayHours: data.delayHours ? parseInt(data.delayHours) : 0,
        isActive: true,
        runCount: 0
      }
    });
    return NextResponse.json(automation, { status: 201 });
  } catch (error) {
    console.error('Error creating automation:', error);
    return NextResponse.json({ error: 'Failed to create automation' }, { status: 500 });
  }
}

// PATCH toggle automation active state
export async function PATCH(request) {
  try {
    const { id, isActive } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const updated = await prisma.basMarketingAutomation.update({
      where: { id },
      data: { isActive }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error toggling automation:', error);
    return NextResponse.json({ error: 'Failed to update automation' }, { status: 500 });
  }
}

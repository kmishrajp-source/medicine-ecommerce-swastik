import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const campaigns = await prisma.basCampaign.findMany({
      orderBy: {
        createdAt: 'desc',
      }
    });
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    if (!data.name || !data.type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    const newCampaign = await prisma.basCampaign.create({
      data: {
        name: data.name,
        type: data.type,
        status: data.status || 'DRAFT',
        budget: data.budget ? parseFloat(data.budget) : 0.0,
        targetAudience: data.targetAudience,
      }
    });

    // Audit Trail
    await prisma.basAuditLog.create({
      data: {
        actionType: 'CREATE_CAMPAIGN',
        module: 'MARKETING',
        targetId: newCampaign.id,
        newValue: newCampaign as any
      }
    }).catch(err => console.error("Audit fail", err));

    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}

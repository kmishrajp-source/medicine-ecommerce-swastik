import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all workflows
export async function GET() {
  try {
    const workflows = await prisma.basWorkflow.findMany({
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
  }
}

// POST create a new workflow
export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.name || !data.triggerType) {
      return NextResponse.json({ error: 'Name and triggerType are required' }, { status: 400 });
    }

    const workflow = await prisma.basWorkflow.create({
      data: {
        name: data.name,
        description: data.description,
        triggerType: data.triggerType,
        isActive: data.isActive !== false,
        steps: data.steps
          ? {
              create: data.steps.map((step, i) => ({
                stepOrder: i + 1,
                actionType: step.actionType,
                actionConfig: step.actionConfig || {},
              })),
            }
          : undefined,
      },
      include: { steps: true },
    });

    return NextResponse.json(workflow, { status: 201 });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
  }
}

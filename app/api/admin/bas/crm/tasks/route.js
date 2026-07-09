import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const assignedToId = searchParams.get('assignedToId');

    const tasks = await prisma.basTask.findMany({
      where: {
        ...(assignedToId && { assignedToId })
      },
      include: {
        lead: {
          select: { id: true, customerName: true, customerPhone: true }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { title, description, type, priority, dueDate, assignedToId, leadId, customerId } = data;

    const newTask = await prisma.basTask.create({
      data: {
        title,
        description,
        type,
        priority: priority || 'Medium',
        dueDate: new Date(dueDate),
        assignedToId,
        leadId,
        customerId,
        status: 'Pending'
      }
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const data = await request.json();
    const { taskId, status } = data;

    if (!taskId) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

    const updatedTask = await prisma.basTask.update({
      where: { id: taskId },
      data: { status }
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

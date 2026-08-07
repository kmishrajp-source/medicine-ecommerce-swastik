import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET notifications for a user (or all if admin)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const notifications = await prisma.basNotification.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST send a new notification
export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.title || !data.body || !data.channel) {
      return NextResponse.json({ error: 'title, body and channel are required' }, { status: 400 });
    }

    const notification = await prisma.basNotification.create({
      data: {
        userId: data.userId || null,
        channel: data.channel,
        title: data.title,
        body: data.body,
        referenceId: data.referenceId,
        referenceType: data.referenceType,
        sentAt: new Date(),
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

// PATCH mark notification as read
export async function PATCH(request) {
  try {
    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }

    await prisma.basNotification.update({
      where: { id: data.id },
      data: { isRead: true },
    });

    return NextResponse.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Error marking notification:', error);
    return NextResponse.json({ error: 'Failed to mark notification' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all communications (SMS, Email, WhatsApp)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const recipientId = searchParams.get('recipientId');

    const comms = await prisma.basCommunication.findMany({
      where: {
        ...(recipientId && { recipientId })
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to recent 50 for performance
    });

    return NextResponse.json(comms);
  } catch (error) {
    console.error('Error fetching communications:', error);
    return NextResponse.json({ error: 'Failed to fetch communications' }, { status: 500 });
  }
}

// POST - Log a new communication (simulate sending)
export async function POST(request) {
  try {
    const data = await request.json();
    const { type, direction, recipientId, senderId, subject, content } = data;

    // In a real scenario, this would trigger Twilio/SendGrid/WhatsApp Cloud API
    // For now, we log it to our unified communication database.

    const newComm = await prisma.basCommunication.create({
      data: {
        type,
        direction,
        recipientId,
        senderId,
        subject,
        content,
        status: direction === 'Outbound' ? 'Sent' : 'Delivered'
      }
    });

    return NextResponse.json(newComm, { status: 201 });
  } catch (error) {
    console.error('Error logging communication:', error);
    return NextResponse.json({ error: 'Failed to log communication' }, { status: 500 });
  }
}

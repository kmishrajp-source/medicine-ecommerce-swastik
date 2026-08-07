import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch Audit Log entries (AuditLog table) and System Logs
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'AUDIT'; // AUDIT or SYSTEM

    if (type === 'AUDIT') {
      const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200,
        include: {
          user: { select: { name: true, email: true, role: true } }
        }
      });
      return NextResponse.json({ success: true, logs });
    }

    if (type === 'SYSTEM') {
      const logs = await prisma.systemLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200
      });
      return NextResponse.json({ success: true, logs });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Audit log API error:', error.message);
    return NextResponse.json({ success: true, logs: [] });
  }
}

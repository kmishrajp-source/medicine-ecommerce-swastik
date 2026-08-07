import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');

    const sops = await prisma.basSopDocument.findMany({
      where: department ? { department } : undefined,
      include: {
        acknowledgements: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(sops);
  } catch (error) {
    console.error('Error fetching SOPs:', error);
    return NextResponse.json({ error: 'Failed to fetch SOPs' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { department, title, description, content, version, authorId } = data;

    if (!department || !title || !content || !authorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sop = await prisma.basSopDocument.create({
      data: {
        department,
        title,
        description,
        content,
        version: version || 1,
        status: 'ACTIVE',
        authorId,
      },
    });

    // Write audit log
    await prisma.basAuditLog.create({
      data: {
        actionType: 'CREATE_SOP',
        module: 'SOP',
        targetId: sop.id,
        newValue: JSON.parse(JSON.stringify(sop)),
      },
    }).catch(err => console.error('Failed to log SOP creation:', err));

    return NextResponse.json(sop, { status: 201 });
  } catch (error) {
    console.error('Error creating SOP:', error);
    return NextResponse.json({ error: 'Failed to create SOP' }, { status: 500 });
  }
}

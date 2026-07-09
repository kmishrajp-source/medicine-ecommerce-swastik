import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const type = searchParams.get('type');

    const documents = await prisma.basDocument.findMany({
      where: {
        ...(customerId && { customerId }),
        ...(type && { type })
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { title, fileUrl, type, customerId, leadId, uploadedById, accessLevel } = data;

    const newDoc = await prisma.basDocument.create({
      data: {
        title,
        fileUrl,
        type,
        customerId,
        leadId,
        uploadedById: uploadedById || 'System',
        accessLevel: accessLevel || 'Private'
      }
    });

    return NextResponse.json(newDoc, { status: 201 });
  } catch (error) {
    console.error('Error uploading document record:', error);
    return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing document ID' }, { status: 400 });

    await prisma.basDocument.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}

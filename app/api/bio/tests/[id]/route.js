import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const test = await prisma.masterTest.findUnique({
      where: { id },
      include: {
        offerings: {
          include: {
            lab: true
          }
        }
      }
    });

    if (!test) {
      return NextResponse.json(
        { success: false, error: 'Test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, test });
  } catch (error) {
    console.error('Error fetching genetic test details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test details' },
      { status: 500 }
    );
  }
}

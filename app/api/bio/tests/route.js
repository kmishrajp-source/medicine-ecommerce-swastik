import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    // Fetch Master Tests instead of LabTests directly to prevent duplicates
    const tests = await prisma.masterTest.findMany({
      where: {
        AND: [
          {
            status: "ACTIVE"
          },
          query ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { displayName: { contains: query, mode: 'insensitive' } },
              { shortName: { contains: query, mode: 'insensitive' } },
              { category: { contains: query, mode: 'insensitive' } }
            ]
          } : {}
        ]
      },
      include: {
        offerings: {
          include: {
            lab: true
          }
        }
      },
      take: 20
    });

    return NextResponse.json({ success: true, tests });
  } catch (error) {
    console.error('Error fetching genetic tests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch genetic tests' },
      { status: 500 }
    );
  }
}

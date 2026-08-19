import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    // Fetch Genetic and Molecular lab tests
    const tests = await prisma.labTest.findMany({
      where: {
        AND: [
          {
            category: {
              in: ['GENETIC', 'MOLECULAR', 'BIOMARKER']
            }
          },
          query ? {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          } : {}
        ]
      },
      include: {
        lab: true
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

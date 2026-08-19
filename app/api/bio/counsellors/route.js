import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    // Fetch Genetic Counsellors
    const counsellors = await prisma.doctor.findMany({
      where: {
        AND: [
          {
            specialization: {
              contains: 'Genetic', // e.g. "Genetic Counsellor", "Medical Geneticist"
              mode: 'insensitive'
            }
          },
          query ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { hospital: { contains: query, mode: 'insensitive' } },
              { city: { contains: query, mode: 'insensitive' } }
            ]
          } : {}
        ]
      },
      take: 20
    });

    return NextResponse.json({ success: true, counsellors });
  } catch (error) {
    console.error('Error fetching genetic counsellors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch genetic counsellors' },
      { status: 500 }
    );
  }
}

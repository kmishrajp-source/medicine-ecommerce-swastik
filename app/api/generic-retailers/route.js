import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const retailers = await prisma.retailer.findMany({
      where: {
        verified: true,
        isGenericStore: true
      },
      select: {
        id: true,
        shopName: true,
        address: true,
        phone: true,
        rating: true,
        photoUrl: true,
        openingHours: true,
        city: true
      },
      orderBy: {
        rating: 'desc'
      }
    });

    return NextResponse.json({ success: true, retailers });
  } catch (error) {
    console.error("Failed to fetch generic retailers:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

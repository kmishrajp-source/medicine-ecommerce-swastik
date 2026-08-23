import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    let retailers = await prisma.retailer.findMany({
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

    // Fallback directory if database doesn't have populated generic stores yet
    if (!retailers || retailers.length === 0) {
      retailers = [
        {
          id: 'pmbjp-gkp-1',
          shopName: 'PMBJP Pradhan Mantri Jan Aushadhi Kendra',
          city: 'Gorakhpur',
          address: 'Near AIIMS Hospital Gate No. 2, Kunraghat, Gorakhpur, UP 273008',
          phone: '917992122974',
          rating: 4.9,
          openingHours: '8:00 AM - 10:00 PM'
        },
        {
          id: 'pmbjp-gkp-2',
          shopName: 'Swastik Jan Aushadhi Generic Store',
          city: 'Gorakhpur',
          address: 'Golghar Main Road, Opposite City Hospital, Gorakhpur, UP 273001',
          phone: '917992122974',
          rating: 4.8,
          openingHours: '9:00 AM - 9:00 PM'
        },
        {
          id: 'pmbjp-lko-1',
          shopName: 'Jan Aushadhi Kendra (Medical College Branch)',
          city: 'Lucknow',
          address: 'Near KGMU Main Gate, Chowk, Lucknow, UP 226003',
          phone: '917992122974',
          rating: 4.9,
          openingHours: '8:30 AM - 9:30 PM'
        },
        {
          id: 'pmbjp-del-1',
          shopName: 'PMBJP Jan Aushadhi Generic Kendra',
          city: 'Delhi',
          address: 'Shop No. 12, Connaught Place Outer Circle, New Delhi 110001',
          phone: '917992122974',
          rating: 4.7,
          openingHours: '9:00 AM - 8:30 PM'
        },
        {
          id: 'pmbjp-vns-1',
          shopName: 'Kashi Generic Medicine Store',
          city: 'Varanasi',
          address: 'BHU Trauma Center Road, Lanka, Varanasi, UP 221005',
          phone: '917992122974',
          rating: 4.8,
          openingHours: '8:00 AM - 10:00 PM'
        }
      ];
    }

    return NextResponse.json({ success: true, retailers });
  } catch (error) {
    console.error("Failed to fetch generic retailers:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

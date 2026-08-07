import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const profile = await prisma.companyProfile.findUnique({
      where: { id: 'default' }
    });

    if (!profile) {
      // Return defaults if not configured yet
      return NextResponse.json({
        companyName: "Swastik Medicare",
        legalEntity: "Swastik Medicare Pvt Ltd",
        cin: "U74999UP202XPTCXXXXXX",
        registrationNumber: "REG-202X-XXXX",
        registeredOffice: "Gorakhpur, Uttar Pradesh, India",
        corporateOffice: "Gorakhpur, Uttar Pradesh, India",
        drugLicense: "UP-XXX-XXXXXX",
        pharmacyRegistration: "PHARM-XXX-XXXXXX",
        gstNumber: "09XXXXXXXXXX1ZX"
      }, { status: 200 });
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return NextResponse.json({ error: 'Failed to fetch company profile' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // Basic auth check would go here for admin

    const body = await req.json();
    
    const profile = await prisma.companyProfile.upsert({
      where: { id: 'default' },
      update: body,
      create: {
        id: 'default',
        ...body
      }
    });

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('Error updating company profile:', error);
    return NextResponse.json({ error: 'Failed to update company profile' }, { status: 500 });
  }
}

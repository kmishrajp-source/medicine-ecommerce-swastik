import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const suppliers = await prisma.basSupplier.findMany({
      orderBy: {
        createdAt: 'desc',
      }
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    if (!data.name) {
      return NextResponse.json({ error: 'Supplier name is required' }, { status: 400 });
    }

    const newSupplier = await prisma.basSupplier.create({
      data: {
        name: data.name,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        address: data.address,
        gstNumber: data.gstNumber,
      }
    });

    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
  }
}

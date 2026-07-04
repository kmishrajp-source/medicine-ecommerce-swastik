import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const purchaseOrders = await prisma.basPurchaseOrder.findMany({
      include: {
        supplier: true,
        items: true
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
    return NextResponse.json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching POs:', error);
    return NextResponse.json({ error: 'Failed to fetch POs' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    if (!data.supplierId || !data.items || !data.items.length) {
      return NextResponse.json({ error: 'Supplier ID and items are required' }, { status: 400 });
    }

    const totalAmount = data.items.reduce((acc, item) => acc + (item.quantityOrdered * item.unitPrice), 0);

    const newPo = await prisma.basPurchaseOrder.create({
      data: {
        supplierId: data.supplierId,
        status: 'DRAFT',
        totalAmount,
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
        notes: data.notes,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantityOrdered: item.quantityOrdered,
            unitPrice: item.unitPrice,
            totalPrice: item.quantityOrdered * item.unitPrice
          }))
        }
      },
      include: {
        items: true,
        supplier: true
      }
    });

    return NextResponse.json(newPo, { status: 201 });
  } catch (error) {
    console.error('Error creating PO:', error);
    return NextResponse.json({ error: 'Failed to create PO' }, { status: 500 });
  }
}

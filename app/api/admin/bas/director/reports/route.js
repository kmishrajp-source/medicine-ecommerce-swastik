import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'sales'; // sales, inventory, customers, complaints

    let data = [];
    let headers = [];

    if (type === 'sales') {
      const orders = await prisma.order.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          status: true,
          paymentMethod: true,
          total: true,
          isPaid: true,
        },
      });
      data = orders.map(o => ({
        OrderID: o.id,
        Date: new Date(o.createdAt).toLocaleDateString(),
        Status: o.status,
        PaymentMethod: o.paymentMethod,
        Total: o.total,
        Paid: o.isPaid ? 'Yes' : 'No',
      }));
      headers = ['OrderID', 'Date', 'Status', 'PaymentMethod', 'Total', 'Paid'];
    } else if (type === 'inventory') {
      const products = await prisma.product.findMany({
        take: 100,
        select: {
          id: true,
          name: true,
          category: true,
          price: true,
          stock: true,
        },
      });
      data = products.map(p => ({
        ProductID: p.id,
        Name: p.name,
        Category: p.category,
        Price: p.price,
        Stock: p.stock,
        TotalValue: p.price * p.stock,
      }));
      headers = ['ProductID', 'Name', 'Category', 'Price', 'Stock', 'TotalValue'];
    } else if (type === 'customers') {
      const users = await prisma.user.findMany({
        take: 100,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });
      data = users.map(u => ({
        CustomerID: u.id,
        Name: u.name || 'Anonymous',
        Email: u.email,
        Role: u.role,
        JoinedDate: new Date(u.createdAt).toLocaleDateString(),
      }));
      headers = ['CustomerID', 'Name', 'Email', 'Role', 'JoinedDate'];
    } else {
      // default dummy info
      data = [{ Message: 'Report type not fully configured, returning mock outline.' }];
      headers = ['Message'];
    }

    return NextResponse.json({ type, headers, rows: data });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report data' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all customer 360 profiles
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // Fetch users who have the role of 'customer' (or similar) and their BasCustomerProfile
    const users = await prisma.user.findMany({
      where: {
        role: 'customer',
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      include: {
        basCustomerProfile: true,
        orders: {
          select: { id: true, total: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Auto-create missing BasCustomerProfile for customers on the fly
    const profiles = await Promise.all(users.map(async (user) => {
      let profile = user.basCustomerProfile;
      if (!profile) {
        // Calculate historical totals
        const totalOrders = user.orders.length;
        const totalSpend = user.orders.reduce((sum, o) => sum + (o.status === 'Delivered' ? o.total : 0), 0);
        const avgOrder = totalOrders > 0 ? totalSpend / totalOrders : 0;
        const lastOrder = user.orders.length > 0 ? user.orders[0].createdAt : null;

        profile = await prisma.basCustomerProfile.create({
          data: {
            userId: user.id,
            classification: 'Retail',
            status: 'Active',
            totalOrders,
            totalSpend,
            averageOrderValue: avgOrder,
            lifetimeValue: totalSpend,
            lastOrderDate: lastOrder
          }
        });
      }
      return {
        ...user,
        basCustomerProfile: profile
      };
    }));

    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Error fetching Customer 360 profiles:', error);
    return NextResponse.json({ error: 'Failed to fetch customer profiles' }, { status: 500 });
  }
}

// POST to update a specific customer profile classification/status
export async function POST(request) {
  try {
    const data = await request.json();
    const { profileId, classification, status, loyaltyPoints } = data;

    if (!profileId) {
      return NextResponse.json({ error: 'Missing profile ID' }, { status: 400 });
    }

    const updated = await prisma.basCustomerProfile.update({
      where: { id: profileId },
      data: {
        classification,
        status,
        ...(loyaltyPoints !== undefined && { loyaltyPoints })
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating customer profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

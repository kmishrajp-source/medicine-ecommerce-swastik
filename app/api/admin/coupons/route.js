import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: List all coupons
export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    // If Coupon model doesn't exist yet, return empty
    console.error('Coupon GET error:', error.message);
    return NextResponse.json({ success: true, coupons: [] });
  }
}

// POST: Create a coupon
export async function POST(request) {
  try {
    const body = await request.json();
    const { code, discountType, discountValue, minOrderValue, maxUses, expiresAt } = body;

    if (!code || !discountValue) {
      return NextResponse.json({ error: 'Code and discount value are required' }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        discountType: discountType || 'PERCENTAGE',
        discountValue: parseFloat(discountValue),
        minOrderValue: parseFloat(minOrderValue || 0),
        maxUses: parseInt(maxUses || 0),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true
      }
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error) {
    console.error('Coupon POST error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Toggle coupon active status
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, isActive } = body;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: { isActive }
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error('Coupon PATCH error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

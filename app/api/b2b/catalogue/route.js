import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * B2B Product Catalogue API
 * GET /api/b2b/catalogue — Returns products available for bulk purchase
 * Reuses existing Product + StockistInventory tables
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minQty = parseInt(searchParams.get('minQty') || '0');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 30;

    // Query existing Product table for B2B catalogue
    const whereClause = {
      AND: [
        search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { salt: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        category ? { category: { contains: category, mode: 'insensitive' } } : {},
        { stock: { gt: minQty } }
      ]
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          brand: true,
          salt: true,
          mrp: true,
          price: true,
          stock: true,
          category: true,
          packOf: true,
          imageUrl: true,
          requiresPrescription: true
        },
        orderBy: { stock: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.product.count({ where: whereClause })
    ]);

    // Also get StockistInventory items that are available for bulk
    const stockistItems = await prisma.stockistInventory.findMany({
      where: search ? { medicineName: { contains: search, mode: 'insensitive' } } : {},
      include: { stockist: { select: { id: true, storeName: true, city: true, verified: true } } },
      take: 20
    });

    // Enrich products with B2B pricing (standard ~15-20% below MRP for bulk)
    const b2bProducts = products.map(p => ({
      ...p,
      b2bPrice: p.mrp ? Math.round(p.mrp * 0.80 * 100) / 100 : p.price, // 20% below MRP
      moq: 10, // Minimum Order Quantity — 10 strips/units
      currency: 'INR',
      availableForBulk: p.stock >= 10,
      sku: `SWM-${p.id.slice(-6).toUpperCase()}`
    }));

    // Supplier catalogue from StockistInventory
    const supplierItems = stockistItems.map(si => ({
      id: `SI-${si.id}`,
      name: si.medicineName,
      b2bPrice: si.price,
      moq: 1,
      stock: si.stock,
      source: 'STOCKIST',
      supplier: {
        id: si.stockist?.id,
        name: si.stockist?.storeName,
        city: si.stockist?.city,
        verified: si.stockist?.verified
      }
    }));

    return NextResponse.json({
      success: true,
      products: b2bProducts,
      supplierItems,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      meta: {
        pricingNote: 'B2B prices shown are indicative. Final price confirmed after RFQ.',
        disclaimer: 'Scheduled / controlled drugs require valid Drug Licence for procurement.'
      }
    });

  } catch (error) {
    console.error('B2B Catalogue Error:', error);
    return NextResponse.json({ error: 'Failed to load catalogue' }, { status: 500 });
  }
}

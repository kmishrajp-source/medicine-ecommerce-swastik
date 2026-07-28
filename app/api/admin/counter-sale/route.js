import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { deductStockAndAlert } from '@/lib/stock-alerts';
import prisma from '@/lib/prisma';

/**
 * POST /api/admin/counter-sale
 * Pharmacist manually records a counter (walk-in) sale.
 * Deducts stock and triggers low-stock alerts if needed.
 *
 * Body: {
 *   items: [{ productId, quantity, price }],
 *   customerName?: string,
 *   customerPhone?: string,
 *   paymentMethod?: 'CASH' | 'UPI' | 'CARD',
 *   notes?: string
 * }
 */
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { items, customerName, customerPhone, paymentMethod = 'CASH', notes } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items provided' }, { status: 400 });
        }

        // Validate all products exist
        const productIds = items.map(i => String(i.productId));
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, stock: true, price: true }
        });

        const productMap = {};
        products.forEach(p => { productMap[p.id] = p; });

        // Check stock availability
        for (const item of items) {
            const product = productMap[String(item.productId)];
            if (!product) {
                return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 });
            }
            if (product.stock < parseInt(item.quantity)) {
                return NextResponse.json({
                    error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
                }, { status: 400 });
            }
        }

        // Calculate total
        const total = items.reduce((sum, item) => {
            const product = productMap[String(item.productId)];
            const price = parseFloat(item.price) || product?.price || 0;
            return sum + (price * parseInt(item.quantity));
        }, 0);

        // Generate counter sale reference
        const saleRef = `CTR-${Date.now().toString(36).toUpperCase()}`;

        // Deduct stock and trigger alerts
        const stockItems = items.map(i => ({ productId: i.productId, quantity: i.quantity }));
        const alerts = await deductStockAndAlert(stockItems, 'COUNTER_SALE', saleRef);

        // Log the sale details (using StockLog for individual items already done inside deductStockAndAlert)
        // Return result with alert summary
        return NextResponse.json({
            success: true,
            saleRef,
            total: parseFloat(total.toFixed(2)),
            paymentMethod,
            itemsSold: items.length,
            customerName: customerName || 'Walk-in',
            alerts: alerts.filter(Boolean).map(a => ({
                medicine: a.medicineName,
                stock: a.currentStock,
                urgency: a.urgency
            })),
            message: `Counter sale recorded. ${alerts.filter(Boolean).length > 0 ? '⚠️ ' + alerts.filter(Boolean).length + ' low stock alert(s) sent!' : 'All stock levels OK.'}`
        });

    } catch (err) {
        console.error('[COUNTER SALE ERROR]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/**
 * GET /api/admin/counter-sale
 * Returns recent counter sales from StockLog.
 */
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');

        const logs = await prisma.stockLog.findMany({
            where: { type: 'COUNTER_SALE' },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                product: {
                    select: { name: true, category: true }
                }
            }
        });

        return NextResponse.json({ success: true, logs });

    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

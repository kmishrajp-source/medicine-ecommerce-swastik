import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getReorderList } from '@/lib/stock-alerts';

/**
 * GET /api/admin/reorder-list
 * Returns all medicines below warning threshold grouped by urgency.
 * Used by the admin inventory Reorder List tab.
 */
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const list = await getReorderList();

        const grouped = {
            OUT_OF_STOCK: list.filter(i => i.urgency === 'OUT_OF_STOCK'),
            CRITICAL:     list.filter(i => i.urgency === 'CRITICAL'),
            LOW:          list.filter(i => i.urgency === 'LOW'),
            WARNING:      list.filter(i => i.urgency === 'WARNING'),
        };

        const totalEstimatedCost = list.reduce((s, i) => s + i.estimatedCost, 0);

        return NextResponse.json({
            success: true,
            summary: {
                outOfStock: grouped.OUT_OF_STOCK.length,
                critical:   grouped.CRITICAL.length,
                low:        grouped.LOW.length,
                warning:    grouped.WARNING.length,
                total:      list.length,
                totalEstimatedCost: parseFloat(totalEstimatedCost.toFixed(2))
            },
            items: grouped,
            all: list
        });

    } catch (err) {
        console.error('[REORDER LIST]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const batchId = searchParams.get('batchId');

        let whereClause = {};
        if (batchId) {
            whereClause = { batchId };
        } else {
            // Default: export all IN_BATCH and PAID items
            whereClause = { status: { in: ['IN_BATCH', 'PAID', 'ELIGIBLE'] } };
        }

        const items = await prisma.settlementItem.findMany({
            where: whereClause,
            include: {
                retailer: {
                    select: {
                        shopName: true,
                        bankAccountName: true,
                        bankAccountNumber: true,
                        bankIfsc: true,
                        bankVerified: true
                    }
                },
                batch: { select: { batchRef: true, status: true, processedAt: true } },
                subOrder: { select: { id: true, total: true, createdAt: true } }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Build CSV rows
        const headers = [
            'Settlement Item ID',
            'Batch Ref',
            'Batch Status',
            'Retailer Name',
            'Bank Account Name',
            'Account Number',
            'IFSC Code',
            'Bank Verified',
            'Sub Order ID',
            'Order Date',
            'Gross Amount (INR)',
            'Commission (INR)',
            'Net Payout (INR)',
            'Status',
            'Processed On'
        ];

        const rows = items.map(item => [
            item.id,
            item.batch?.batchRef || 'UNBATCHED',
            item.batch?.status || item.status,
            item.retailer?.shopName || '',
            item.retailer?.bankAccountName || '',
            item.retailer?.bankAccountNumber || '',
            item.retailer?.bankIfsc || '',
            item.retailer?.bankVerified ? 'YES' : 'NO',
            item.subOrderId,
            item.subOrder?.createdAt ? new Date(item.subOrder.createdAt).toLocaleDateString('en-IN') : '',
            item.grossAmount.toFixed(2),
            item.commission.toFixed(2),
            item.netAmount.toFixed(2),
            item.status,
            item.batch?.processedAt ? new Date(item.batch.processedAt).toLocaleDateString('en-IN') : ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const filename = batchId
            ? `settlement-batch-${batchId.slice(-6)}.csv`
            : `settlements-export-${new Date().toISOString().slice(0, 10)}.csv`;

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-store'
            }
        });

    } catch (error) {
        console.error("Settlement CSV Export Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

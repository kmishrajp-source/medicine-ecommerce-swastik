import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'RETAILER') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const retailer = await prisma.retailer.findFirst({
            where: { userId: session.user.id }
        });

        if (!retailer) {
            return NextResponse.json({ error: "Retailer not found" }, { status: 404 });
        }

        // Fetch all settlement items for this retailer, grouped by batch
        const settlementItems = await prisma.settlementItem.findMany({
            where: { retailerId: retailer.id },
            include: {
                batch: {
                    select: { batchRef: true, status: true, processedAt: true, createdAt: true }
                },
                subOrder: {
                    select: { id: true, total: true, createdAt: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Group items by batch for the ledger view
        const batchMap = new Map();
        let totalEligible = 0;
        let totalPaid = 0;
        let totalPending = 0;

        for (const item of settlementItems) {
            // Aggregate totals
            if (item.status === 'PAID') totalPaid += item.netAmount;
            else if (item.status === 'ELIGIBLE') totalEligible += item.netAmount;
            else if (item.status === 'IN_BATCH') totalPending += item.netAmount;

            const batchKey = item.batchId || `UNBATCHED-${item.id}`;
            if (!batchMap.has(batchKey)) {
                batchMap.set(batchKey, {
                    id: item.batchId || null,
                    batchRef: item.batch?.batchRef || 'Eligible (Unbatched)',
                    date: item.batch?.createdAt || item.createdAt,
                    processedAt: item.batch?.processedAt || null,
                    status: item.batch?.status || item.status,
                    orderCount: 0,
                    grossAmount: 0,
                    commission: 0,
                    netAmount: 0,
                    refunds: 0
                });
            }

            const entry = batchMap.get(batchKey);
            entry.orderCount += 1;
            entry.grossAmount += item.grossAmount;
            entry.commission += item.commission;
            entry.netAmount += item.netAmount;
        }

        const ledger = Array.from(batchMap.values()).sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );

        return NextResponse.json({
            success: true,
            ledger,
            summary: {
                totalEligible: totalEligible.toFixed(2),
                totalPending: totalPending.toFixed(2),
                totalPaid: totalPaid.toFixed(2)
            }
        });

    } catch (error) {
        console.error("Retailer Settlements GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

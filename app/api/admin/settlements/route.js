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
        // 1. Fetch Eligible Items ready to be batched
        const eligibleItems = await prisma.settlementItem.findMany({
            where: { status: 'ELIGIBLE' },
            include: {
                retailer: { select: { shopName: true, bankAccountName: true, bankAccountNumber: true, bankIfsc: true, bankVerified: true } },
                subOrder: { select: { total: true } }
            },
            orderBy: { createdAt: 'asc' }
        });

        // 2. Fetch existing batches
        const batches = await prisma.settlementBatch.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { items: true } }
            }
        });

        return NextResponse.json({ success: true, eligibleItems, batches });
    } catch (error) {
        console.error("Admin Settlements GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { itemIds } = await req.json();

        if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
            return NextResponse.json({ error: "No items selected for batching" }, { status: 400 });
        }

        // Verify items are still ELIGIBLE
        const items = await prisma.settlementItem.findMany({
            where: { id: { in: itemIds }, status: 'ELIGIBLE' }
        });

        if (items.length !== itemIds.length) {
            return NextResponse.json({ error: "Some items are no longer eligible. Please refresh." }, { status: 400 });
        }

        const totalAmount = items.reduce((sum, item) => sum + item.netAmount, 0);
        const batchRef = `STL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        // Create the batch and update items
        const batch = await prisma.$transaction(async (tx) => {
            const newBatch = await tx.settlementBatch.create({
                data: {
                    batchRef,
                    totalAmount,
                    status: 'PROCESSING'
                }
            });

            await tx.settlementItem.updateMany({
                where: { id: { in: itemIds } },
                data: {
                    batchId: newBatch.id,
                    status: 'IN_BATCH'
                }
            });

            return newBatch;
        });
        
        // Audit log
        await prisma.systemLog.create({
            data: {
                userId: session.user.id,
                action: "SETTLEMENT_BATCH_CREATED",
                details: `Created batch ${batchRef} with ${itemIds.length} items. Total: ${totalAmount}.`,
                level: "INFO"
            }
        });

        return NextResponse.json({ success: true, batch });

    } catch (error) {
        console.error("Admin Settlements POST Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { batchId } = await req.json();

        if (!batchId) {
            return NextResponse.json({ error: "Batch ID is required" }, { status: 400 });
        }

        const updatedBatch = await prisma.$transaction(async (tx) => {
            const batch = await tx.settlementBatch.update({
                where: { id: batchId },
                data: {
                    status: 'PAID',
                    processedAt: new Date()
                }
            });

            await tx.settlementItem.updateMany({
                where: { batchId: batchId },
                data: { status: 'PAID' }
            });

            return batch;
        });

        // Audit log
        await prisma.systemLog.create({
            data: {
                userId: session.user.id,
                action: "SETTLEMENT_BATCH_PAID",
                details: `Marked batch ${updatedBatch.batchRef} as PAID.`,
                level: "INFO"
            }
        });

        return NextResponse.json({ success: true, batch: updatedBatch });

    } catch (error) {
        console.error("Admin Settlements PUT Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const batchNumber = searchParams.get('batchNumber');

        if (!batchNumber) {
            // Return all unique batches that have movements
            const batches = await prisma.erpBatch.findMany({
                where: {
                    movements: { some: {} }
                },
                include: {
                    movements: {
                        orderBy: { timestamp: 'desc' },
                        take: 1
                    }
                },
                take: 50
            });
            return NextResponse.json({ success: true, batches });
        }

        // Return movements for a specific batch
        const batch = await prisma.erpBatch.findFirst({
            where: { batchNumber },
            include: {
                movements: {
                    orderBy: { timestamp: 'desc' }
                }
            }
        });

        if (!batch) {
            return NextResponse.json({ success: false, error: "Batch not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, batch });

    } catch (error) {
        console.error("Admin Tracking GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { batchId, fromEntityId, toEntityId, entityType, action, quantity, notes } = body;

        if (!batchId || !action || !quantity) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const movement = await prisma.supplyChainMovement.create({
            data: {
                batchId,
                fromEntityId,
                toEntityId,
                entityType: entityType || 'STOCKIST',
                action,
                quantity: parseInt(quantity),
                notes
            }
        });

        return NextResponse.json({ success: true, movement });
    } catch (error) {
        console.error("Admin Tracking POST Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

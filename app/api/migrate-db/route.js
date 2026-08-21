import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
    try {
        const queries = [
            `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3);`,
            `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "codCollectedAmount" DOUBLE PRECISION DEFAULT 0;`,
            `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "codReconciled" BOOLEAN DEFAULT false;`,
            `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryInstructions" TEXT;`,
            `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryProofUrl" TEXT;`,
            `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "tamperSealCode" TEXT;`,
            `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "integrityStatus" TEXT DEFAULT 'PENDING';`,
            `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "integrityCheckAt" TIMESTAMP(3);`,
            `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "integrityCheckNotes" TEXT;`,
            `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "settlementStatus" TEXT DEFAULT 'PENDING';`,
            `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);`,
            `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "pickupType" TEXT DEFAULT 'RETAILER';`,
            `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "pickupId" TEXT;`,
            `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "tipAmount" DOUBLE PRECISION DEFAULT 0;`
        ];

        for (const query of queries) {
            try {
                await prisma.$executeRawUnsafe(query);
                console.log(`Executed: ${query}`);
            } catch (err) {
                console.error(`Error executing: ${query}`, err.message);
                // Continue with next queries even if one fails (e.g. column already exists)
            }
        }

        return NextResponse.json({ success: true, message: 'Database schema synchronized.' });
    } catch (error) {
        console.error('Migration Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
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
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();

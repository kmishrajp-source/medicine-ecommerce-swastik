import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "productName" TEXT;`);
        console.log('Migration OK: productName column added to OrderItem');
    } catch (e) {
        console.error('Migration Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}
run();

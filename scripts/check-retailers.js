const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRetailers() {
    try {
        const count = await prisma.retailer.count();
        console.log('Retailer count:', count);
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

checkRetailers();

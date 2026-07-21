const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.product.count();
        console.log('Product count:', count);
        if (count > 0) {
            const sample = await prisma.product.findFirst();
            console.log('Sample product:', sample.name);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}
main();

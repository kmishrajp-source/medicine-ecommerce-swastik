const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const products = await prisma.product.findMany({ take: 5 });
        console.log('PRODUCTS_DATA:', JSON.stringify(products));
        const userCount = await prisma.user.count();
        console.log('USER_COUNT:', userCount);
        const productCount = await prisma.product.count();
        console.log('PRODUCT_COUNT:', productCount);
    } catch (e) {
        console.error('DB_CHECK_FAILED:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();

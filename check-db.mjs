import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
    try {
        const orderIdQuery = await prisma.order.findFirst({
            orderBy: { createdAt: 'desc' },
            include: { items: { include: { product: true } } }
        });
        console.log('Latest Order:', orderIdQuery.id, 'Delivery Code:', orderIdQuery.deliveryCode);
        orderIdQuery.items.forEach(item => {
            console.log(`- Item ID: ${item.id}, product.name: ${item.product?.name}, productName (snapshot): ${item.productName}`);
        });
    } catch (e) {
        console.error('Migration Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}
run();

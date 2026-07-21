const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const cats = await prisma.product.groupBy({ by: ['category'], _count: { id: true }});
        console.log(cats);
    } catch(err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
main();

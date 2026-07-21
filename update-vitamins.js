const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Find some supplements
        const supplements = await prisma.product.findMany({
            where: { category: 'Supplements' },
            take: 6
        });
        
        for (const prod of supplements) {
            await prisma.product.update({
                where: { id: prod.id },
                data: { category: 'Vitamins' }
            });
            console.log('Changed', prod.name, 'to Vitamins');
        }
        
        console.log('Categories updated successfully!');
    } catch(err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
main();

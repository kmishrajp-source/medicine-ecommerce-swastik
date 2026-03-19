const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    try {
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: 'Carvedilol', mode: 'insensitive' } },
                    { name: { contains: 'Dolo', mode: 'insensitive' } }
                ]
            },
            take: 5
        });
        console.log("Found Products:", JSON.stringify(products, null, 2));
    } catch (e) {
        console.error("Error fetching data:", e);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();

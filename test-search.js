const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const search = 'Dolo';
        const t0 = Date.now();
        const res = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { salt: { contains: search, mode: 'insensitive' } },
                    { brand: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            },
            take: 10
        });
        const t1 = Date.now();
        console.log(`Search Results for ${search}:`, res.length, `(Time: ${t1 - t0}ms)`);
        // console.log(res);
    } catch(e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

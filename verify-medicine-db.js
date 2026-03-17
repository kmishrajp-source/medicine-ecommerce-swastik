const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.product.count();
        console.log(`Total Medicines in Database: ${count}`);

        const samples = await prisma.product.findMany({
            take: 5,
            select: {
                name: true,
                manufacturer: true,
                composition: true,
                salt: true,
                mrp: true,
                uses: true
            }
        });

        console.log("\nSample Medicine Details:");
        console.table(samples);

        // Check for common Indian brands to verify market linkage
        const indianBrands = await prisma.product.findMany({
            where: {
                OR: [
                    { manufacturer: { contains: 'Cipla', mode: 'insensitive' } },
                    { manufacturer: { contains: 'Sun Pharma', mode: 'insensitive' } },
                    { manufacturer: { contains: 'Dr. Reddy', mode: 'insensitive' } },
                    { name: { contains: 'Crocin', mode: 'insensitive' } }
                ]
            },
            take: 5,
            select: { name: true, manufacturer: true }
        });
        console.log("\nIndian Market Linkage Check (Top Brands):");
        console.table(indianBrands);

    } catch (e) {
        console.error("Verification failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

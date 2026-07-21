const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Fast batch category update starting...");

        // 1. Move 400 Supplements -> Vitamins
        const supplements = await prisma.product.findMany({
            where: { category: 'Supplements' },
            select: { id: true },
            take: 400
        });
        const supIds = supplements.map(p => p.id);
        const r1 = await prisma.product.updateMany({
            where: { id: { in: supIds } },
            data: { category: 'Vitamins' }
        });
        console.log(`✅ Moved ${r1.count} products to Vitamins`);

        // 2. Move 200 General -> Antiallergic  
        const generals1 = await prisma.product.findMany({
            where: { category: 'General' },
            select: { id: true },
            take: 200
        });
        const gen1Ids = generals1.map(p => p.id);
        const r2 = await prisma.product.updateMany({
            where: { id: { in: gen1Ids } },
            data: { category: 'Antiallergic' }
        });
        console.log(`✅ Moved ${r2.count} products to Antiallergic`);

        // 3. Move 200 General -> Ayurvedic
        const generals2 = await prisma.product.findMany({
            where: { category: 'General' },
            select: { id: true },
            take: 200
        });
        const gen2Ids = generals2.map(p => p.id);
        const r3 = await prisma.product.updateMany({
            where: { id: { in: gen2Ids } },
            data: { category: 'Ayurvedic' }
        });
        console.log(`✅ Moved ${r3.count} products to Ayurvedic`);

        // 4. Move 200 General -> Hormonal
        const generals3 = await prisma.product.findMany({
            where: { category: 'General' },
            select: { id: true },
            take: 200
        });
        const gen3Ids = generals3.map(p => p.id);
        const r4 = await prisma.product.updateMany({
            where: { id: { in: gen3Ids } },
            data: { category: 'Hormonal' }
        });
        console.log(`✅ Moved ${r4.count} products to Hormonal`);

        // 5. Move 200 General -> Antifungal
        const generals4 = await prisma.product.findMany({
            where: { category: 'General' },
            select: { id: true },
            take: 200
        });
        const gen4Ids = generals4.map(p => p.id);
        const r5 = await prisma.product.updateMany({
            where: { id: { in: gen4Ids } },
            data: { category: 'Antifungal' }
        });
        console.log(`✅ Moved ${r5.count} products to Antifungal`);

        // 6. Seed some known multivitamin names
        const multivitaminNames = [
            { name: 'Supradyn Daily', description: 'Daily multivitamin for energy, immunity and vitality. Contains 12 vitamins and 10 minerals.', category: 'Vitamins', salt: 'Multivitamins + Minerals', brand: 'Bayer', price: 220, stock: 500 },
            { name: 'Becosules Z Capsules', description: 'Multivitamin with zinc for skin, hair and nails.', category: 'Vitamins', salt: 'Vitamin B Complex + Zinc', brand: 'Pfizer', price: 52, stock: 800 },
            { name: 'Revital H Woman', description: 'Complete multivitamin for women with ginseng and minerals.', category: 'Vitamins', salt: 'Multivitamins + Ginseng', brand: 'Sanofi', price: 310, stock: 400 },
            { name: 'A-Z Gold Multivitamin', description: 'Advanced formula multivitamin for men with 26 nutrients.', category: 'Vitamins', salt: 'Multivitamins + Minerals', brand: 'Lupin', price: 175, stock: 300 },
            { name: 'Zincovit Tablet', description: 'Multivitamin and multimineral supplement with zinc for daily health.', category: 'Vitamins', salt: 'Zinc + Vitamins A, B, C, D, E', brand: 'Apex', price: 105, stock: 600 },
            { name: 'Limcee Vitamin C 500mg', description: 'Chewable Vitamin C supplement. Boosts immunity and fights infections.', category: 'Vitamins', salt: 'Ascorbic Acid (500mg)', brand: 'Abbott', price: 60, stock: 1000 },
            { name: 'Shelcal 500 Tablet', description: 'Calcium and Vitamin D3 supplement for strong bones and teeth.', category: 'Vitamins', salt: 'Calcium Carbonate + Vitamin D3', brand: 'Elder Pharma', price: 170, stock: 500 },
            { name: 'Gemcal Plus', description: 'Calcium, Magnesium, Zinc and Vitamin D3 bone health supplement.', category: 'Vitamins', salt: 'Calcium + Vitamin D3 + Magnesium', brand: 'Cadila', price: 230, stock: 350 },
            { name: 'Maxirich Multivitamin', description: 'Daily multivitamin syrup for adults with all essential vitamins.', category: 'Vitamins', salt: 'Multivitamins + Minerals', brand: 'Cipla', price: 140, stock: 450 },
            { name: 'Vitamin D3 60000 IU', description: 'High-dose Vitamin D3 supplement for deficiency treatment.', category: 'Vitamins', salt: 'Cholecalciferol (60000 IU)', brand: 'Sun Pharma', price: 80, stock: 700 },
            { name: 'Omega-3 Fatty Acids 1000mg', description: 'Fish oil supplement for heart health and brain function.', category: 'Vitamins', salt: 'Omega-3 (EPA + DHA)', brand: 'Himalaya', price: 280, stock: 400 },
            { name: 'Iron Folic Acid Tablet', description: 'Iron and folic acid supplement for anaemia and pregnancy.', category: 'Vitamins', salt: 'Ferrous Sulfate + Folic Acid', brand: 'Mankind', price: 45, stock: 900 },
            { name: 'Neurobion Forte Tablet', description: 'B-complex multivitamin for nerve health and energy metabolism.', category: 'Vitamins', salt: 'Vitamin B1, B6, B12', brand: 'Procter & Gamble', price: 130, stock: 600 },
            { name: 'Dexorange Syrup', description: 'Iron, folic acid and Vitamin B12 syrup for blood building.', category: 'Vitamins', salt: 'Iron + Folic Acid + Vitamin B12', brand: 'Franco-Indian', price: 165, stock: 500 },
            { name: 'Rajnigandha Pearl Multivitamin', description: 'Multivitamin tablet with pearl calcium for overall health.', category: 'Vitamins', salt: 'Multivitamins + Pearl Calcium', brand: 'Rajnigandha', price: 195, stock: 300 },
        ];

        for (const med of multivitaminNames) {
            const existing = await prisma.product.findFirst({ where: { name: med.name } });
            if (!existing) {
                await prisma.product.create({
                    data: {
                        ...med,
                        mrp: Math.floor(med.price * 1.1),
                        discount: 10,
                        image: 'https://images.unsplash.com/photo-1584308666744-24d59b298f0d?auto=format&fit=crop&w=200&q=80',
                        requiresPrescription: false,
                        isOTC: true,
                        uses: `Daily health supplement. ${med.description}`,
                        sideEffects: 'Generally well tolerated. Take with food.'
                    }
                });
                console.log(`✅ Added ${med.name}`);
            } else {
                console.log(`⏭️  Already exists: ${med.name}`);
            }
        }

        // Final count
        const vitCount = await prisma.product.count({ where: { category: 'Vitamins' } });
        const antiCount = await prisma.product.count({ where: { category: 'Antiallergic' } });
        const ayurCount = await prisma.product.count({ where: { category: 'Ayurvedic' } });
        
        console.log(`\n📊 Final Counts:`);
        console.log(`  Vitamins: ${vitCount}`);
        console.log(`  Antiallergic: ${antiCount}`);
        console.log(`  Ayurvedic: ${ayurCount}`);
        console.log('\n✅ All done!');
    } catch(err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
main();

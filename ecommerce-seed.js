const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
    const categories = ['General', 'Pain Relief', 'Antibiotics', 'Supplements', 'Ayurvedic', 'Diabetes', 'Cardiology', 'Dermatology'];

    console.log('Generating 100 medicines...');

    // Clear existing just in case there are a few broken ones
    await prisma.product.deleteMany({});

    const medicines = Array.from({ length: 100 }, (_, i) => {
        const category = categories[i % categories.length];
        return {
            name: `Generic Med ${category} ${i + 1}`,
            description: `High quality simulated medicine for ${category} treatments. Contains active pharmaceutical ingredients approved for distribution.`,
            price: Math.floor(Math.random() * 500) + 50,
            image: "https://images.unsplash.com/photo-1584308666744-24d59b298f0d?auto=format&fit=crop&w=400&q=80",
            category: category,
            requiresPrescription: Math.random() > 0.7,
            stock: Math.random() > 0.2 ? Math.floor(Math.random() * 200) + 10 : 0, // 20% out of stock
            createdAt: new Date()
        }
    });

    try {
        await prisma.product.createMany({ data: medicines });
        console.log('✅ Successfully seeded 100 medicines to Supabase!');
    } catch (e) {
        console.error('❌ Failed to seed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

seed();

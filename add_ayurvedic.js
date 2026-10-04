const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addAyurvedic() {
    const products = [
        {
            name: 'Patanjali Ashwagandha Churna',
            description: '100% natural Ayurvedic stress relief and immunity booster.',
            price: 85.00,
            image: 'https://images.unsplash.com/photo-1626240243171-460ce01df1e8?auto=format&fit=crop&w=400&q=80',
            category: 'Ayurvedic',
            requiresPrescription: false,
            stock: 100,
            brand: 'Patanjali',
            salt: 'Ashwagandha'
        },
        {
            name: 'Dabur Chyawanprash',
            description: 'Ayurvedic health supplement for building strength and stamina.',
            price: 350.00,
            image: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=400&q=80',
            category: 'Ayurvedic',
            requiresPrescription: false,
            stock: 50,
            brand: 'Dabur',
            salt: 'Amla, Ashwagandha, Giloy'
        }
    ];

    for (let p of products) {
        await prisma.product.create({ data: p });
        console.log(`Added: ${p.name}`);
    }
    console.log("Ayurvedic products added successfully.");
}

addAyurvedic().catch(console.error).finally(() => prisma.$disconnect());

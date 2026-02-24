const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MEDICINES = [
    // I will read this from the data file dynamically in a real app, 
    // but for this script I'll paste a subset or try to import if supported.
    // Since importing ES modules in CommonJS is tricky without setup, I will manually add the categories loop here.
];

async function main() {
    console.log('Start seeding ...');

    // Create Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@swastik.com' },
        update: {},
        create: {
            email: 'admin@swastik.com',
            name: 'Swastik Admin',
            password: 'pranshu@2007', // In real app, hash this!
            role: 'ADMIN',
        },
    });
    console.log(`Created user: ${admin.name}`);

    // Generate 100 Medicines
    const categories = ["Pain Relief", "Antibiotics", "Supplements", "Allergy", "Diabetes", "Cardiology", "Dermatology", "Gastrointestinal"];

    for (let i = 1; i <= 100; i++) {
        const category = categories[i % categories.length];
        const basePrice = (Math.random() * 500) + 50;
        const price = Math.floor(basePrice);
        let name = `${category} Medicine ${i}`;
        let requiresPrescription = false;

        // Simple logic to match the data.js roughly
        if (category === "Antibiotics" || category === "Cardiology") requiresPrescription = true;

        let image = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200";

        await prisma.product.create({
            data: {
                name,
                description: `Effective for ${category.toLowerCase()}.`,
                price: parseFloat(price),
                image,
                category,
                requiresPrescription,
                stock: 100
            }
        });
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

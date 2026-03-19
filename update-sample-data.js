const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.kklkpnzwxaxekxraqswh:Shivangi%40%23%242004@db.kklkpnzwxaxekxraqswh.supabase.co:5432/postgres'
    }
  }
});

async function main() {
  try {
    const updates = [
      {
        name: 'Dolo 650 Tablet',
        data: {
          brand: 'Micro Labs Ltd',
          salt: 'Paracetamol (650mg)',
          uses: 'Pain relief, Treatment of Fever',
          sideEffects: 'Nausea, Vomiting, Insomnia',
          mrp: 34.18,
          price: 30.50,
          discount: 10,
          packSize: '15 Tablets in 1 Strip'
        }
      },
      {
        name: 'Pan 40 Tablet',
        data: {
          brand: 'Alkem Laboratories Ltd',
          salt: 'Pantoprazole (40mg)',
          uses: 'Treatment of Gastroesophageal reflux disease (Acid reflux), Treatment of Peptic ulcer disease',
          sideEffects: 'Diarrhea, Headache, Dizziness',
          mrp: 175.00,
          price: 140.00,
          discount: 20,
          packSize: '15 Tablets in 1 Strip'
        }
      }
    ];

    for (const update of updates) {
      const result = await prisma.product.updateMany({
        where: { name: { contains: update.name, mode: 'insensitive' } },
        data: update.data
      });
      console.log(`Updated ${update.name}: ${result.count} records`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

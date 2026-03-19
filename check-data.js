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
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { name: { contains: 'Carvedilol', mode: 'insensitive' } },
          { salt: { not: null } }
        ]
      },
      take: 2
    });
    console.log(JSON.stringify(products, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

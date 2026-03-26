const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.product.count();
    console.log('TOTAL_PRODUCTS_COUNT:' + count);
  } catch (err) {
    console.error('DATABASE_ERROR:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

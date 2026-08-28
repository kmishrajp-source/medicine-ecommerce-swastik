const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.labTest.count({
    where: { category: { in: ['GENETIC', 'MOLECULAR', 'BIOMARKER'] } }
  });
  console.log('Genetic tests count:', count);
}
main().catch(console.error).finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasourceUrl: process.env.DIRECT_URL // Force using the direct 5432 port for data insertion if 6543 fails
});

async function main() {
  console.log('🚀 Starting Prisma-based restoration...');
  
  // Try to count first
  try {
      const count = await prisma.product.count();
      console.log('Current product count:', count);
  } catch (e) {
      console.log('Count failed, table might not exist or connection failed:', e.message);
  }

  console.log('💉 Creating sample medicines...');
  try {
      for (let i = 0; i < 20; i++) {
        await prisma.product.create({
          data: {
            name: `Top Medicine ${i + 1}`,
            description: 'Quality medicine from Swastik Medicare.',
            price: 150.0 + i,
            image: 'https://images.unsplash.com/photo-1584308666744-24d59b298f0d',
            category: 'General',
            stock: 500,
            isRecommended: true
          }
        });
      }
      console.log('✅ 20 Medicines created!');
  } catch(e) {
      console.error('❌ Insert failed:', e.message);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

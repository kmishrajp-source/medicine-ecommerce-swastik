const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRiders() {
  const riders = await prisma.deliveryAgent.findMany({
    where: {
      OR: [
        { isOnline: true },
        { isAvailable: true }
      ]
    },
    select: {
      id: true,
      userId: true,
      isOnline: true,
      isAvailable: true,
      city: true,
      phone: true
    }
  });

  const totalRiders = await prisma.deliveryAgent.count();
  
  console.log(`Total Riders in DB: ${totalRiders}`);
  console.log(`Online/Available Riders: ${riders.length}`);
  
  riders.forEach(r => {
    console.log(`- [${r.id}] User ID: ${r.userId} | Online: ${r.isOnline} | Available: ${r.isAvailable} | City: ${r.city} | Phone: ${r.phone}`);
  });
}

checkRiders()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSMS() {
  const smsLogs = await prisma.sMSLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log("Recent SMS Logs:");
  console.table(smsLogs);
  
  const leads = await prisma.lead.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  console.log("Recent Customer Intelligence Leads:");
  console.table(leads.map(l => ({ id: l.id, name: l.guestName, phone: l.guestPhone, status: l.status, tags: l.tags })));

}
checkSMS().catch(console.error).finally(() => prisma.$disconnect());

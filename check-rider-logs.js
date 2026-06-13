const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== RECENT OTP RECORDS ===");
    const otps = await prisma.oTP.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10
    });
    console.log(JSON.stringify(otps, null, 2));

    console.log("\n=== RECENT SMS LOGS ===");
    const smsLogs = await prisma.sMSLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10
    });
    console.log(JSON.stringify(smsLogs, null, 2));

    console.log("\n=== RECENT DELIVERY AGENT USERS ===");
    const users = await prisma.user.findMany({
        where: { role: 'DELIVERY' },
        include: { deliveryAgent: true },
        orderBy: { createdAt: 'desc' },
        take: 10
    });
    console.log(JSON.stringify(users, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

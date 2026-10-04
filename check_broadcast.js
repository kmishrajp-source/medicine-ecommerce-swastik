const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBroadcastSystem() {
    // Customer count (registered users)
    const customerCount = await prisma.user.count({ where: { role: 'CUSTOMER' } });

    // Guest order phone numbers
    const orders = await prisma.order.findMany({ select: { guestPhone: true } });
    const guestPhones = [...new Set(orders.map(o => o.guestPhone).filter(Boolean))];

    // Registered user phones
    const users = await prisma.user.findMany({ where: { role: 'CUSTOMER' }, select: { deviceId: true, name: true } });
    const userPhones = [...new Set(users.map(u => u.deviceId).filter(Boolean))];

    // Combined unique
    const allPhones = [...new Set([...userPhones, ...guestPhones])];

    // Campaign history
    let campaigns = [];
    try {
        campaigns = await prisma.broadcastCampaign.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10
        });
    } catch(e) { campaigns = []; }

    // WhatsApp API status
    const hasWAKey = !!process.env.WHATSAPP_API_URL;
    const hasMSG91 = !!process.env.MSG91_AUTH_KEY;

    console.log('\n=================================================');
    console.log('   BROADCAST SYSTEM — FULL DIAGNOSTIC REPORT');
    console.log('=================================================\n');
    console.log(`👥 Registered Customers (role=CUSTOMER): ${customerCount}`);
    console.log(`📞 Registered user phones available:     ${userPhones.length}`);
    console.log(`🧾 Guest order phones available:         ${guestPhones.length}`);
    console.log(`📱 TOTAL UNIQUE PHONEABLE CONTACTS:      ${allPhones.length}`);
    console.log('');
    console.log(`🔑 WhatsApp API configured: ${hasWAKey ? '✅ YES' : '❌ NO (WHATSAPP_API_URL missing)'}`);
    console.log(`🔑 SMS (MSG91) configured:  ${hasMSG91 ? '✅ YES' : '❌ NO (MSG91_AUTH_KEY missing)'}`);
    console.log('');
    if (campaigns.length > 0) {
        console.log(`📨 PAST BROADCAST CAMPAIGNS (${campaigns.length} found):`);
        console.table(campaigns.map(c => ({
            id: c.id.slice(-8),
            audience: c.audience,
            method: c.method,
            status: c.status,
            sent: c.totalSent,
            failed: c.totalFailed,
            date: new Date(c.createdAt).toLocaleDateString('en-IN')
        })));
    } else {
        console.log('📨 No broadcast campaigns found in history.');
    }
}

checkBroadcastSystem().catch(console.error).finally(() => prisma.$disconnect());

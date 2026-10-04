const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkIntelligence() {
    // Total leads
    const totalLeads = await prisma.lead.count();
    
    // Breakdown by status
    const byStatus = await prisma.lead.groupBy({
        by: ['status'],
        _count: { id: true }
    });

    // Breakdown by source
    const bySource = await prisma.lead.groupBy({
        by: ['source'],
        _count: { id: true }
    });

    // Leads with phone numbers (can receive WhatsApp)
    const withPhone = await prisma.lead.count({
        where: { guestPhone: { not: null } }
    });

    // Recent 10 leads
    const recent = await prisma.lead.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, guestName: true, guestPhone: true, status: true, source: true, tags: true, createdAt: true }
    });

    // WhatsApp batches sent
    let waBatches = 0;
    try {
        waBatches = await prisma.whatsappBatch.count();
    } catch(e) { waBatches = 'Table not found'; }

    console.log('\n========================================');
    console.log('   CUSTOMER INTELLIGENCE REPORT');
    console.log('========================================\n');
    console.log(`📊 TOTAL LEADS IN DATABASE: ${totalLeads}`);
    console.log(`📱 LEADS WITH PHONE (WhatsApp-able): ${withPhone}`);
    console.log(`\n📋 BREAKDOWN BY STATUS:`);
    byStatus.forEach(s => console.log(`   ${s.status}: ${s._count.id}`));
    console.log(`\n🔗 BREAKDOWN BY SOURCE:`);
    bySource.forEach(s => console.log(`   ${s.source || 'unknown'}: ${s._count.id}`));
    console.log(`\n📨 WHATSAPP CAMPAIGNS SENT: ${waBatches}`);
    console.log(`\n👥 RECENT 10 LEADS:`);
    console.table(recent.map(l => ({
        name: l.guestName || 'N/A',
        phone: l.guestPhone || 'N/A',
        status: l.status,
        source: l.source || 'N/A',
        tags: l.tags?.join(',') || '',
        added: new Date(l.createdAt).toLocaleDateString('en-IN')
    })));
}

checkIntelligence().catch(console.error).finally(() => prisma.$disconnect());

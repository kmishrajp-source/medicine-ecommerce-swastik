const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function processNewLeads() {
    console.log("📨 Starting Automated WhatsApp Outreach for new leads...");
    
    try {
        const { SSMSAutomation } = await import('../lib/ssms-automation.js');
        
        const newLeads = await prisma.lead.findMany({
            where: { status: 'new' }
        });

        console.log(`📊 Found ${newLeads.length} new leads to process.`);

        for (const lead of newLeads) {
            console.log(`➡️ Processing lead: ${lead.guestName} (${lead.guestPhone})`);
            
            // Trigger WhatsApp Intro
            await SSMSAutomation.onStatusChange(lead.id, 'new');
            
            // Update status to prevent double-sending
            await prisma.lead.update({
                where: { id: lead.id },
                data: { status: 'outreach_sent', lastContactDate: new Date() }
            });
            
            console.log(`✅ Outreach sent for ${lead.guestName}`);
        }

        console.log("🎉 All new leads processed successfully.");

    } catch (error) {
        console.error("❌ Lead processing failed:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

processNewLeads();

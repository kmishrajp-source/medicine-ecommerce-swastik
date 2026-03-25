const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function followUpCron() {
    console.log("⏰ Running Daily Follow-up Cron...");
    
    try {
        const { SSMSAutomation } = await import('../lib/ssms-automation.js');
        
        // Find leads who were contacted but haven't replied or converted in 2+ days
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const leadsToFollowUp = await prisma.lead.findMany({
            where: {
                status: 'outreach_sent',
                updatedAt: { lte: twoDaysAgo }
            }
        });

        console.log(`📊 Found ${leadsToFollowUp.length} leads due for follow-up.`);

        for (const lead of leadsToFollowUp) {
            console.log(`🔔 Sending reminder to: ${lead.guestName}`);
            
            // Trigger Follow-up WhatsApp (Simulated logic in SSMSAutomation)
            await SSMSAutomation.onStatusChange(lead.id, 'follow_up');
            
            // Update status
            await prisma.lead.update({
                where: { id: lead.id },
                data: { status: 'follow_up_sent' }
            });
        }

        console.log("✅ Follow-up cron completed.");

    } catch (error) {
        console.error("❌ Follow-up cron failed:", error.message);
        if (error.message.includes("Can't reach database")) {
            console.log("⚠️ DB unreachable. Use 'MOCK_DB=true node ...' for local testing.");
        }
    } finally {
        await prisma.$disconnect();
    }
}

followUpCron();

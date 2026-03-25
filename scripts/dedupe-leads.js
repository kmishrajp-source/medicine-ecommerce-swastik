const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function dedupeLeads() {
    console.log("🔍 Searching for duplicate leads...");
    
    try {
        const leads = await prisma.lead.findMany();
        const seen = new Set();
        let deletedCount = 0;

        for (const lead of leads) {
            // Generate a unique key based on name and phone (if available)
            const key = `${lead.guestName?.toLowerCase()}_${lead.guestPhone || ''}`.trim();
            
            if (seen.has(key)) {
                await prisma.lead.delete({
                    where: { id: lead.id }
                });
                deletedCount++;
                console.log(`🗑️ Deleted duplicate lead: ${lead.guestName} (${lead.guestPhone})`);
            } else {
                seen.add(key);
            }
        }

        console.log(`✅ Deduplication complete. Removed ${deletedCount} duplicates.`);

    } catch (error) {
        console.error("❌ Deduplication failed:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

dedupeLeads();

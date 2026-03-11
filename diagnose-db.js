const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Product table columns...");
    try {
        const columns = await prisma.$queryRaw`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Product'
        `;
        console.log("Product columns:", columns.map(c => c.column_name));

        console.log("\nChecking for marketplace tables...");
        const tables = ['SubOrder', 'DraftInvoice', 'MedicinePriceMemory', 'SubstitutionRule', 'DeliveryAssignment', 'WebhookConfig', 'AdminApprovalLog'];
        for (const table of tables) {
            const result = await prisma.$queryRawUnsafe(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = '${table}'
                );
            `);
            console.log(`Table ${table} exists:`, result[0].exists);
        }
    } catch (e) {
        console.error("Diagnostic failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

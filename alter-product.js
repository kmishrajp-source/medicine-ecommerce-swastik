const { Client } = require('pg');

async function alter() {
    const client = new Client({
        host: 'aws-1-ap-northeast-2.pooler.supabase.com',
        port: 6543,
        user: 'postgres.kklkpnzwxaxekxraqswh',
        password: 'SwastikMedicare@2026',
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        await client.query(`
            ALTER TABLE "Product" 
            ADD COLUMN IF NOT EXISTS "isScheduleH1" BOOLEAN DEFAULT false, 
            ADD COLUMN IF NOT EXISTS "isColdChain" BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS "stock" INTEGER DEFAULT 100, 
            ADD COLUMN IF NOT EXISTS "uses" TEXT, 
            ADD COLUMN IF NOT EXISTS "sideEffects" TEXT, 
            ADD COLUMN IF NOT EXISTS "packSize" TEXT, 
            ADD COLUMN IF NOT EXISTS "expiryDate" TIMESTAMP(3), 
            ADD COLUMN IF NOT EXISTS "batchNumber" TEXT,
            ADD COLUMN IF NOT EXISTS "manufacturerId" TEXT,
            ADD COLUMN IF NOT EXISTS "composition" TEXT;
        `);
        console.log('✅ Columns added.');
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log('✅ Schema reloaded.');
    } catch (err) {
        console.error('❌ Failed:', err.message);
    } finally {
        await client.end();
    }
}

alter();

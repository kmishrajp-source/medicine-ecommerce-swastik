const { Client } = require('pg');

async function fixProduct() {
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
            ADD COLUMN IF NOT EXISTS "isRecommended" BOOLEAN DEFAULT false;
        `);
        console.log('✅ Column isRecommended added.');
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log('✅ Schema reloaded.');
    } catch (err) {
        console.error('❌ Failed:', err.message);
    } finally {
        await client.end();
    }
}

fixProduct();

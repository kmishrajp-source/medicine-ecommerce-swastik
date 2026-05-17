const { Client } = require('pg');

async function reloadCache() {
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
        console.log('✅ Connected to database.');
        console.log('🔄 Requesting schema cache reload...');
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log('✅ Schema cache reloaded successfully!');
    } catch (err) {
        console.error('❌ Failed to reload cache:', err.message);
    } finally {
        await client.end();
    }
}

reloadCache();

const { Client } = require('pg');

async function grantAccess() {
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
        await client.query('GRANT ALL ON TABLE "Product" TO anon, authenticated, service_role;');
        console.log('✅ Grants added successfully.');
    } catch (err) {
        console.error('❌ Failed:', err.message);
    } finally {
        await client.end();
    }
}

grantAccess();

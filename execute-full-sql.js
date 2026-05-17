
const { Client } = require('pg');
const fs = require('fs');

async function execute() {
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
        console.log('✅ Connected.');

        console.log('🗑️ Dropping existing public schema...');
        await client.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO anon; GRANT ALL ON SCHEMA public TO authenticated; GRANT ALL ON SCHEMA public TO service_role;');

        const sql = fs.readFileSync('schema-full.sql', 'utf8');
        const statements = sql.split(';').filter(s => s.trim().length > 0);
        console.log(`🔨 Executing ${statements.length} SQL statements...`);
        
        for (const statement of statements) {
            try {
                await client.query(statement);
            } catch (e) {
                console.error(`  ⚠️ Statement failed: ${e.message.substring(0, 50)}...`);
            }
        }
        console.log('✅ Full Schema initialization attempt finished!');
        
    } catch (err) {
        console.error('❌ Execution failed:', err.message);
    } finally {
        await client.end();
    }
}

execute();

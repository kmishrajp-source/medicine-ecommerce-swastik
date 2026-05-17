const { Client } = require('pg');

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
        console.log('✅ Connected to port 6543.');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "Product" (
                "id" TEXT PRIMARY KEY,
                "name" TEXT NOT NULL,
                "description" TEXT NOT NULL,
                "price" DOUBLE PRECISION NOT NULL,
                "image" TEXT NOT NULL,
                "category" TEXT NOT NULL,
                "requiresPrescription" BOOLEAN DEFAULT false,
                "salt" TEXT,
                "manufacturer" TEXT,
                "brand" TEXT,
                "mrp" DOUBLE PRECISION DEFAULT 0.0,
                "discount" DOUBLE PRECISION DEFAULT 0.0,
                "isOTC" BOOLEAN DEFAULT false
            );
        `);
        console.log('✅ Product table created/verified.');
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log('✅ Schema cache reloaded.');
    } catch (err) {
        console.error('❌ Connection or execution failed:', err.message);
    } finally {
        await client.end();
    }
}

execute();

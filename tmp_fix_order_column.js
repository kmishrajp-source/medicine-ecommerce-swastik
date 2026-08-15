const { Client } = require('pg');

const client = new Client({ 
    connectionString: 'postgresql://postgres.kklkpnzwxaxekxraqswh:SwastikMedicare%402026@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres' 
});

client.connect().then(async () => {
    try {
        console.log("Adding codCollectedAmount column to Order table...");
        await client.query(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "codCollectedAmount" DOUBLE PRECISION DEFAULT 0;`);
        console.log("✅ Successfully fixed Order table!");
    } catch(e) {
        console.error("❌ Failed to alter table:", e.message);
    }
    client.end();
}).catch(e => {
    console.error("❌ Connection failed:", e.message);
});

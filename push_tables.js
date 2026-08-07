const { Client } = require('pg');
const fs = require('fs');

// Use the pgbouncer/pooler URL (port 6543) - same one that works in production
const connectionString = "postgresql://postgres.kklkpnzwxaxekxraqswh:SwastikMedicare%402026@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres";

console.log('Connecting to Supabase via pooler (port 6543)...');

const client = new Client({ 
    connectionString: connectionString, 
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000
});

const sql = fs.readFileSync('new_tables.sql', 'utf8');

// Split into individual statements to handle them one by one
const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

async function run() {
    try {
        await client.connect();
        console.log('Connected successfully!');
        
        let success = 0;
        let skipped = 0;
        let errors = [];
        
        for (const stmt of statements) {
            try {
                await client.query(stmt);
                success++;
                const match = stmt.match(/CREATE TABLE "([^"]+)"/);
                if (match) console.log(`✓ Created table: ${match[1]}`);
            } catch (err) {
                if (err.message.includes('already exists')) {
                    skipped++;
                    console.log(`→ Already exists (skipped)`);
                } else {
                    errors.push({ stmt: stmt.substring(0, 60), error: err.message });
                    console.log(`✗ Error: ${err.message}`);
                }
            }
        }
        
        console.log(`\n=== DONE ===`);
        console.log(`Executed: ${success}, Skipped (already exist): ${skipped}, Errors: ${errors.length}`);
        if (errors.length > 0) {
            console.log('\nErrors:');
            errors.forEach(e => console.log(`  - ${e.stmt}: ${e.error}`));
        }
    } catch (err) {
        console.error('CONNECTION ERROR:', err.message);
    } finally {
        try { await client.end(); } catch(e) {}
    }
}

run();

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function main() {
    const sqlPath = path.join(__dirname, 'supabase', 'remediate-supabase.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    const simpleSql = sql.replace('BEGIN;', '').replace('COMMIT;', '');

    console.log("Starting DB Remediation (Direct Link Attempt)...");

    // Direct URL constructed from the pooler URL
    const directUrl = "postgresql://postgres.kklkpnzwxaxekxraqswh:Shivangi%40%23%242004@db.kklkpnzwxaxekxraqswh.supabase.co:5432/postgres";

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: directUrl
            }
        }
    });

    try {
        console.log("Executing SQL on port 5432...");
        await prisma.$executeRawUnsafe(simpleSql);
        console.log("✅ Remediation SQL executed successfully via Direct URL.");
    } catch (e) {
        console.error("❌ Direct execution failed:", e.message);
        console.log("\nTIP: Please run the SQL in 'supabase/remediate-supabase.sql' manually in your Supabase SQL Editor.");
    } finally {
        await prisma.$disconnect();
    }
}

main();

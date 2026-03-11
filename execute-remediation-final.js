const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function main() {
    const sqlPath = path.join(__dirname, 'supabase', 'remediate-supabase.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    const simpleSql = sql.replace('BEGIN;', '').replace('COMMIT;', '');

    console.log("Starting DB Remediation (Supabase Direct Attempt)...");

    // Using the DIRECT_URL from .env.vercel
    const directUrl = "postgresql://postgres.kklkpnzwxaxekxraqswh:Shivangi%40%23%242004@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: directUrl
            }
        }
    });

    try {
        console.log("Executing SQL on port 5432 (aws-0 direct)...");
        await prisma.$executeRawUnsafe(simpleSql);
        console.log("✅ Remediation SQL executed successfully via Direct URL.");
    } catch (e) {
        console.error("❌ Direct execution failed:", e.message);
        console.log("\nTrying with simplified statements...");
        const statements = simpleSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
        for (const s of statements) {
            try {
                await prisma.$executeRawUnsafe(s);
            } catch (err) {
                console.warn(`⚠️ Statement failed: ${s.slice(0, 50)}... Error: ${err.message}`);
            }
        }
        console.log("Finished attempting partial remediation.");
    } finally {
        await prisma.$disconnect();
    }
}

main();

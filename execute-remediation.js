const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function main() {
    // Attempt with the direct URL if possible, otherwise use the env one
    const sqlPath = path.join(__dirname, 'supabase', 'remediate-supabase.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Starting DB Remediation...");

    // We try to use the PrismaClient which uses the process.env.PRISMA_DATABASE_URL
    const prisma = new PrismaClient();

    try {
        console.log("Executing SQL blocks...");
        // Prisma's executeRawUnsafe cannot handle multiple statements in one call easily with BEGIN/COMMIT if the driver/pooler blocks it.
        // But since this is a single execution, we'll try it.
        await prisma.$executeRawUnsafe(sql);
        console.log("✅ Remediation SQL executed successfully.");
    } catch (e) {
        console.error("❌ Execution failed via Prisma:", e.message);
        console.log("\nAttempting to execute block by block...");

        // Fallback: Split by BEGIN/COMMIT or just try to run the whole thing without them if it's the pooler
        const simpleSql = sql.replace('BEGIN;', '').replace('COMMIT;', '');
        try {
            await prisma.$executeRawUnsafe(simpleSql);
            console.log("✅ Remediation SQL (simplified) executed successfully.");
        } catch (e2) {
            console.error("❌ Fallback execution also failed:", e2.message);
            console.log("\nTIP: Please run the SQL in 'supabase/remediate-supabase.sql' manually in your Supabase SQL Editor if this continues to fail.");
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();

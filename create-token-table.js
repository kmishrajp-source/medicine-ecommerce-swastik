const { Client } = require('pg');

async function createTable() {
    // using the direct session pooler port 5432
    const url = 'postgresql://postgres.kklkpnzwxaxekxraqswh:Shivangi%40%23%242004@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres';
    const client = new Client({ connectionString: url });

    try {
        await client.connect();
        console.log('Connected to Supabase PostgreSQL cluster.');

        const query = `
            CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
                "id" TEXT NOT NULL,
                "email" TEXT NOT NULL,
                "token" TEXT NOT NULL,
                "expiresAt" TIMESTAMP(3) NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
            );
            CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
        `;

        await client.query(query);
        console.log('✅ PasswordResetToken table created successfully bypass Prisma limitations!');
    } catch (e) {
        console.error('❌ SQL Injection Error:', e.message);
    } finally {
        await client.end();
    }
}

createTable();

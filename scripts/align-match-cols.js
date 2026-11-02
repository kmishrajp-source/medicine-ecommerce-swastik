const { Client } = require('pg');
require('dotenv').config();

async function addCol() {
  const client = new Client({ connectionString: process.env.DIRECT_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(`
    ALTER TABLE "EnquiryProviderMatch" ADD COLUMN IF NOT EXISTS "matchReasons" JSONB;
    ALTER TABLE "EnquiryProviderMatch" ADD COLUMN IF NOT EXISTS "isLeadUnlocked" BOOLEAN DEFAULT FALSE;
    ALTER TABLE "EnquiryProviderMatch" ADD COLUMN IF NOT EXISTS "unlockedAt" TIMESTAMP(3);
    ALTER TABLE "EnquiryProviderMatch" ADD COLUMN IF NOT EXISTS "unlockFee" DOUBLE PRECISION DEFAULT 0.0;
  `);
  console.log('EnquiryProviderMatch columns aligned in DB!');
  await client.end();
}
addCol().catch(console.error);


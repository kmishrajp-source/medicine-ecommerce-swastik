const { Client } = require('pg');
require('dotenv').config();

async function seedMatches() {
  const client = new Client({ connectionString: process.env.DIRECT_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const providers = [
    { providerId: 'sp-eq-001', providerType: 'SUPPLIER', businessName: 'Purvanchal MedTech & Surgical Supplies', score: 95 },
    { providerId: 'sp-eq-002', providerType: 'SUPPLIER', businessName: 'MediLine Healthcare Solutions Pvt Ltd', score: 92 },
    { providerId: 'sp-eq-003', providerType: 'SUPPLIER', businessName: 'Swastik Medical Equipment Hub', score: 88 },
  ];

  for (const p of providers) {
    await client.query(`
      INSERT INTO "EnquiryProviderMatch" (
        "id", "enquiryId", "providerType", "providerId", "providerBusinessName", "matchScore", "scoreBreakdown", "status"
      ) VALUES (
        $1, 'enq-demo-001', $2, $3, $4, $5, '{"reasons": ["Direct category match", "Service coverage in Gorakhpur"]}', 'NOTIFIED'
      ) ON CONFLICT ("id") DO NOTHING;
    `, [`match-demo-${p.providerId}`, p.providerType, p.providerId, p.businessName, p.score]);
  }

  const count = await client.query('SELECT count(*) FROM "EnquiryProviderMatch";');
  console.log('Total EnquiryProviderMatch rows in DB:', count.rows[0].count);

  await client.end();
}

seedMatches().catch(console.error);

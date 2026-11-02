const { Client } = require('pg');
require('dotenv').config();

async function checkProviderCounts() {
  const client = new Client({ connectionString: process.env.DIRECT_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const tables = ['Doctor', 'Retailer', 'Lab', 'Hospital', 'Ambulance', 'ProviderServiceListing', 'ProviderVerification'];
  for (const t of tables) {
    try {
      const res = await client.query(`SELECT count(*) FROM "${t}"`);
      console.log(`${t} count:`, res.rows[0].count);
    } catch (e) {
      console.log(`${t} error:`, e.message);
    }
  }
  await client.end();
}
checkProviderCounts().catch(console.error);


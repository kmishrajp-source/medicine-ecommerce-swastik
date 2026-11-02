const { Client } = require('pg');
require('dotenv').config();
const { HEALTHMART_CATEGORIES } = require('../lib/healthmart/categories.js');

async function compareSlugs() {
  const client = new Client({ connectionString: process.env.DIRECT_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query('SELECT slug, name FROM "MarketplaceCategory" ORDER BY "sortOrder"');
  console.log('DB Categories (' + res.rows.length + '):');
  res.rows.forEach(r => console.log('  DB:', r.slug));

  console.log('\nJS File Categories (' + HEALTHMART_CATEGORIES.length + '):');
  HEALTHMART_CATEGORIES.forEach(c => {
    const dbMatch = res.rows.find(r => r.slug === c.slug);
    console.log('  JS:', c.slug, dbMatch ? '✅ MATCH' : '❌ MISMATCH (Not in DB!)');
  });

  await client.end();
}
compareSlugs().catch(console.error);


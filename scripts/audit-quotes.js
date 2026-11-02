const { Client } = require('pg');
require('dotenv').config();

async function checkQuotes() {
  const client = new Client({ connectionString: process.env.DIRECT_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query('SELECT id, "quoteNumber", "enquiryId", "providerBusinessName", "totalAmount", status, "createdAt" FROM "ProviderQuotation" ORDER BY "createdAt" DESC LIMIT 15');
  console.log('ProviderQuotation rows in Supabase (' + res.rows.length + '):');
  res.rows.forEach(r => console.log(`  - ${r.quoteNumber} | ${r.providerBusinessName} | ₹${r.totalAmount} | status: ${r.status} | enq: ${r.enquiryId}`));
  const total = await client.query('SELECT count(*) FROM "ProviderQuotation"');
  console.log('Total ProviderQuotation records in DB:', total.rows[0].count);
  await client.end();
}
checkQuotes().catch(console.error);


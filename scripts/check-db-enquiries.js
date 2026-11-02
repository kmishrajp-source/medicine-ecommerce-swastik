const { Client } = require('pg');
require('dotenv').config();

async function check() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  const enq = await client.query('SELECT id, "enquiryNumber", title, status FROM "BuyerEnquiry" LIMIT 10;');
  console.log('Enquiries in DB:', enq.rows);

  const quo = await client.query('SELECT id, "quoteNumber", "enquiryId", "providerBusinessName", "totalAmount" FROM "ProviderQuotation" LIMIT 10;');
  console.log('Quotations in DB:', quo.rows);

  const match = await client.query('SELECT count(*) FROM "EnquiryProviderMatch";');
  console.log('Matches count:', match.rows[0]);

  await client.end();
}

check().catch(console.error);


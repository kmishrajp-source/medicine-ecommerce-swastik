const { Client } = require('pg');
require('dotenv').config();

async function checkProductRefs() {
  const client = new Client({ connectionString: process.env.DIRECT_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const oi = await client.query('SELECT count(*) FROM "OrderItem";');
  const sl = await client.query('SELECT count(*) FROM "StockLog";');
  const pi = await client.query('SELECT count(*) FROM "PharmacyInventory";');
  console.log('OrderItem count:', oi.rows[0].count);
  console.log('StockLog count:', sl.rows[0].count);
  console.log('PharmacyInventory count:', pi.rows[0].count);
  await client.end();
}
checkProductRefs().catch(console.error);


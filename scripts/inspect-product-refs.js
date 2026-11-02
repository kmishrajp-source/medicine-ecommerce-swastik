const { Client } = require('pg');
require('dotenv').config();

async function inspectRefs() {
  const client = new Client({ connectionString: process.env.DIRECT_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const oi = await client.query('SELECT DISTINCT "productId" FROM "OrderItem";');
  const sl = await client.query('SELECT DISTINCT "productId" FROM "StockLog";');
  const pi = await client.query('SELECT DISTINCT "productId" FROM "PharmacyInventory";');

  const refIds = new Set([
    ...oi.rows.map(r => r.productId),
    ...sl.rows.map(r => r.productId),
    ...pi.rows.map(r => r.productId)
  ]);

  console.log('Total unique referenced product IDs:', refIds.size);
  const sample = Array.from(refIds).slice(0, 10);
  console.log('Sample referenced IDs:', sample);

  // Check their current names
  const prods = await client.query('SELECT id, name, category, price FROM "Product" WHERE id = ANY($1)', [Array.from(refIds)]);
  console.log('Referenced products in DB:');
  prods.rows.forEach(p => console.log(`  - ${p.id}: "${p.name}" (${p.category}, ₹${p.price})`));

  await client.end();
}

inspectRefs().catch(console.error);


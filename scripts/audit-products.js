const { Client } = require('pg');
require('dotenv').config();

async function checkProducts() {
  const client = new Client({ connectionString: process.env.DIRECT_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query('SELECT id, name, price, category, description FROM "Product" LIMIT 30');
  console.log('Total products in sample:', res.rows.length);
  res.rows.forEach(r => {
    console.log(`- Name: "${r.name}" | Price: ₹${r.price} | Category: ${r.category} | Desc: ${(r.description || '').slice(0, 60)}`);
  });
  const count = await client.query('SELECT count(*) FROM "Product"');
  console.log('\nTotal count in Product table:', count.rows[0].count);
  await client.end();
}
checkProducts().catch(console.error);


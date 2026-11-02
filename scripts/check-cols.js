const { Client } = require('pg');
require('dotenv').config();

async function checkCols() {
  const client = new Client({ connectionString: process.env.DIRECT_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'EnquiryProviderMatch';");
  console.log('Columns in EnquiryProviderMatch:', res.rows.map(r => r.column_name));
  await client.end();
}
checkCols().catch(console.error);


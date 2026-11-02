const { Client } = require('pg');
require('dotenv').config();

async function checkHealthMartTables() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND (
        table_name ILIKE '%marketplace%' 
        OR table_name ILIKE '%enquiry%' 
        OR table_name ILIKE '%quotation%'
        OR table_name ILIKE '%providerservice%'
      )
    ORDER BY table_name;
  `);
  console.log('HealthMart tables found:', res.rows.map(r => r.table_name));
  await client.end();
}

checkHealthMartTables().catch(err => {
  console.error(err);
  process.exit(1);
});

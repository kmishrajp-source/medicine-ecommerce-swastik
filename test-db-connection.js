require('dotenv').config();
const { Client } = require('pg');

async function test() {
  const client = new Client({
    connectionString: process.env.PRISMA_DATABASE_URL.replace(/"/g, ''),
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Server time:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error:', err.stack);
  }
}

test();

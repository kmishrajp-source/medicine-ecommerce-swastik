const { Client } = require('pg');

async function test() {
  console.log('Testing local PostgreSQL connection:');
  const client = new Client({
    user: 'postgres',
    password: 'password',
    host: 'localhost',
    port: 5432,
    database: 'postgres'
  });
  
  try {
    await client.connect();
    console.log('✅ Local PostgreSQL connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Server time:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('❌ Local PostgreSQL failed:', err.message);
  }
}

test();

const { Client } = require('pg');

async function test() {
  const client = new Client({
    connectionString: "postgresql://postgres.kklkpnzwxaxekxraqswh:Shivangi%40%23%242004@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres",
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected successfully!');
    const res = await client.query('SELECT COUNT(*) FROM "User"');
    console.log('User count:', res.rows[0].count);
    await client.end();
  } catch (err) {
    console.error('Connection error:', err.stack);
  }
}

test();

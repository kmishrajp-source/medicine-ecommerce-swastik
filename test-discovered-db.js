const { Client } = require('pg');

async function test() {
  const connectionString = "postgresql://postgres.kklkpnzwxaxekxraqswh:Shivangi%40%23%242004@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('Connecting to Supabase (Pooler Direct Port 5432)...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const res = await client.query('SELECT COUNT(*) FROM "Product"');
    console.log('Current Product count:', res.rows[0].count);
    
    await client.end();
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }
}

test();

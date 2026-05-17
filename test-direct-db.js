const { Client } = require('pg');

async function test() {
  // Direct connection string to Supabase (Port 5432)
  const connectionString = "postgresql://postgres:Shivangi2004@db.kklkpnzwxaxekxraqswh.supabase.co:5432/postgres";
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('Connecting to Supabase (Direct Port 5432)...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const res = await client.query('SELECT COUNT(*) FROM "Product"');
    console.log('Product count:', res.rows[0].count);
    
    const docRes = await client.query('SELECT COUNT(*) FROM "Doctor"');
    console.log('Doctor count:', docRes.rows[0].count);
    
    await client.end();
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }
}

test();

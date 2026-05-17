
const { Client } = require('pg');

async function test() {
  // Real direct connection bypassing the pooler
  const connectionString = "postgresql://postgres:Shivangi2004@db.kklkpnzwxaxekxraqswh.supabase.co:5432/postgres";
  
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('Connecting to Supabase DIRECTLY (Port 5432)...');
    await client.connect();
    console.log('Connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Server time:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error:', err.message);
    console.log('\nTrying another host variant...');
    
    // Alternative host variant
    const connectionStringAlt = "postgresql://postgres:Shivangi2004@kklkpnzwxaxekxraqswh.supabase.co:5432/postgres";
    const clientAlt = new Client({
      connectionString: connectionStringAlt,
      ssl: { rejectUnauthorized: false }
    });
    
    try {
        await clientAlt.connect();
        console.log('Connected successfully via alternative host!');
        await clientAlt.end();
    } catch (errAlt) {
        console.error('Alternative host failed too:', errAlt.message);
    }
  }
}

test();

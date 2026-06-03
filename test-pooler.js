const { Client } = require('pg');

const passwords = [
  'Shivangi@#$2004',
  'Shivangi2004',
  'Shivangi@2004'
];

async function test() {
  for (const password of passwords) {
    console.log(`Testing host: aws-0-ap-northeast-2.pooler.supabase.com with port 6543 and password: ${password}`);
    const client = new Client({
      user: 'postgres.kklkpnzwxaxekxraqswh',
      password: password,
      host: 'aws-0-ap-northeast-2.pooler.supabase.com',
      port: 6543,
      database: 'postgres',
      ssl: { rejectUnauthorized: false }
    });
    
    try {
      await client.connect();
      console.log(`✅ SUCCESS! password: ${password}`);
      const res = await client.query('SELECT COUNT(*) FROM "User"');
      console.log('User count:', res.rows[0].count);
      await client.end();
      return; // Stop on first success
    } catch (err) {
      console.error(`❌ FAILED: ${err.message}`);
    }
    console.log('----------------------------------------');
  }
}

test();

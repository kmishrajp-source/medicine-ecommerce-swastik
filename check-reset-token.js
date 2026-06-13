const { Client } = require('pg');

const passwords = [
  'Shivangi@#$2004',
  'Shivangi2004',
  'Shivangi@2004'
];

const hosts = [
  'aws-0-ap-northeast-2.pooler.supabase.com',
  'aws-1-ap-northeast-2.pooler.supabase.com'
];

const ports = [5432, 6543];

async function testConnection(host, port, password) {
  console.log(`Testing host=${host} port=${port} password=${password}`);
  const client = new Client({
    user: 'postgres.kklkpnzwxaxekxraqswh',
    password: password,
    host: host,
    port: port,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully!');

    // Check table
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'PasswordResetToken'
      );
    `);
    console.log('PasswordResetToken table exists:', tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
      const cols = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'PasswordResetToken';
      `);
      console.log('Columns:', cols.rows);

      const rows = await client.query('SELECT * FROM "PasswordResetToken";');
      console.log('Rows:', rows.rows);
    }
    await client.end();
    return true;
  } catch (err) {
    console.log('❌ Error:', err.message);
    try { await client.end(); } catch(e) {}
    return false;
  }
}

async function main() {
  for (const host of hosts) {
    for (const port of ports) {
      for (const password of passwords) {
        const ok = await testConnection(host, port, password);
        if (ok) {
          console.log('SUCCESS!');
          return;
        }
        console.log('----------------------------------------');
      }
    }
  }
}

main();

require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const password = encodeURIComponent('Shivangi@#$2004');
  const connString = `postgresql://postgres.kklkpnzwxaxekxraqswh:${password}@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres`;
  console.log("Connecting to aws-0");
  
  const client = new Client({
    connectionString: connString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
      await client.connect();
      console.log("Connected to DB via aws-0");
      
      const res = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      console.log("Tables in public schema:");
      res.rows.forEach(r => console.log(r.table_name));
      await client.end();
  } catch (err) {
      console.error(err);
  }
}

main().catch(console.error);

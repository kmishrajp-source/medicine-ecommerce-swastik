const fetch = require('node-fetch');

async function test() {
  const url = 'https://kklkpnzwxaxekxraqswh.supabase.co/rest/v1/';
  console.log('Fetching Supabase REST API:', url);
  try {
    const res = await fetch(url);
    console.log('Response status:', res.status);
    const text = await res.text();
    console.log('Response body:', text);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

test();

const fs = require('fs');
const input = fs.readFileSync('supabase_push.sql', 'utf8');
const output = input.replace(/CREATE TABLE "/g, 'CREATE TABLE IF NOT EXISTS "');
fs.writeFileSync('supabase_push_safe.sql', output);
console.log('Done! Lines:', output.split('\n').length);

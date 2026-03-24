const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl);
console.log('Key (prefix):', supabaseServiceKey ? supabaseServiceKey.substring(0, 10) + '...' : 'MISSING');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
    const { data, error } = await supabase.from('User').select('id').limit(1);
    if (error) {
        console.error('❌ Connection Error:', error);
    } else {
        console.log('✅ Connection Successful! Data:', data);
    }
}

test();

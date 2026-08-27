// Test script: verify OPENAI_API_KEY, MSG91_AUTH_KEY, MSG91_WHATSAPP_NUMBER, ADMIN_PHONE
// Run with: node test-env-credentials.mjs

import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import fetch from 'node-fetch';

// Load from multiple env files
try { dotenv.config({ path: '.env' }); } catch {}
try { dotenv.config({ path: '.env.local', override: false }); } catch {}
// For production values, also try .env.swastik
try { dotenv.config({ path: '.env.swastik', override: false }); } catch {}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_WHATSAPP_NUMBER = process.env.MSG91_WHATSAPP_NUMBER;
const ADMIN_PHONE = process.env.ADMIN_PHONE;

console.log('\n=== SWASTIK MEDICARE — ENVIRONMENT VARIABLES TEST ===\n');

// ─── 1. CHECK PRESENCE ───────────────────────────────────────────────────────
console.log('📋 1. VARIABLE PRESENCE CHECK:');
console.log(`   OPENAI_API_KEY       : ${OPENAI_API_KEY ? '✅ SET (' + OPENAI_API_KEY.slice(0, 8) + '...)' : '❌ MISSING'}`);
console.log(`   MSG91_AUTH_KEY       : ${MSG91_AUTH_KEY ? '✅ SET (' + MSG91_AUTH_KEY.slice(0, 8) + '...)' : '❌ MISSING'}`);
console.log(`   MSG91_WHATSAPP_NUMBER: ${MSG91_WHATSAPP_NUMBER ? '✅ SET (' + MSG91_WHATSAPP_NUMBER + ')' : '❌ MISSING'}`);
console.log(`   ADMIN_PHONE          : ${ADMIN_PHONE ? '✅ SET (' + ADMIN_PHONE + ')' : '❌ MISSING'}`);
console.log('');

// ─── 2. TEST OPENAI ───────────────────────────────────────────────────────────
async function testOpenAI() {
  console.log('🤖 2. TESTING OPENAI API KEY...');
  if (!OPENAI_API_KEY) {
    console.log('   ❌ Skipped — OPENAI_API_KEY not set.\n');
    return false;
  }
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Say OK in 2 words.' }],
        max_tokens: 10
      })
    });
    const data = await res.json();
    if (res.ok && data.choices) {
      console.log(`   ✅ SUCCESS — Model: ${data.model}`);
      console.log(`   📝 Response: "${data.choices[0].message.content.trim()}"\n`);
      return true;
    } else {
      console.log(`   ❌ FAILED — ${JSON.stringify(data.error || data)}\n`);
      return false;
    }
  } catch (err) {
    console.log(`   ❌ ERROR — ${err.message}\n`);
    return false;
  }
}

// ─── 3. TEST MSG91 AUTH KEY ───────────────────────────────────────────────────
async function testMSG91Auth() {
  console.log('📱 3. TESTING MSG91 AUTH KEY (balance check)...');
  if (!MSG91_AUTH_KEY) {
    console.log('   ❌ Skipped — MSG91_AUTH_KEY not set.\n');
    return false;
  }
  try {
    const res = await fetch(`https://api.msg91.com/api/balance.php?authkey=${MSG91_AUTH_KEY}&type=1&response=json`);
    const data = await res.json();
    if (data.type === 'success' || data.balance !== undefined) {
      console.log(`   ✅ SUCCESS — MSG91 Auth Key valid. Balance: ${data.balance ?? 'N/A'}\n`);
      return true;
    } else {
      console.log(`   ❌ FAILED — MSG91 response: ${JSON.stringify(data)}\n`);
      return false;
    }
  } catch (err) {
    console.log(`   ❌ ERROR — ${err.message}\n`);
    return false;
  }
}

// ─── 4. TEST WHATSAPP NUMBER ──────────────────────────────────────────────────
async function testWhatsApp() {
  console.log('💬 4. TESTING MSG91 WHATSAPP NUMBER...');
  if (!MSG91_WHATSAPP_NUMBER) {
    console.log('   ❌ Skipped — MSG91_WHATSAPP_NUMBER not set.\n');
    return false;
  }
  // We just validate format, as sending a live WA message would incur cost
  const valid = /^91\d{10}$/.test(MSG91_WHATSAPP_NUMBER.replace(/\D/g, ''));
  if (valid) {
    console.log(`   ✅ FORMAT OK — ${MSG91_WHATSAPP_NUMBER} is a valid Indian mobile number.\n`);
    return true;
  } else {
    console.log(`   ⚠️  FORMAT WARNING — "${MSG91_WHATSAPP_NUMBER}" doesn't look like a valid Indian number (expected 91XXXXXXXXXX).\n`);
    return false;
  }
}

// ─── 5. SUMMARY ───────────────────────────────────────────────────────────────
async function runAll() {
  const openai = await testOpenAI();
  const msg91 = await testMSG91Auth();
  const wa = await testWhatsApp();

  console.log('=== TEST SUMMARY ===');
  console.log(`   OpenAI API Key   : ${openai ? '✅ Working' : '❌ Failed/Missing'}`);
  console.log(`   MSG91 Auth Key   : ${msg91 ? '✅ Working' : '❌ Failed/Missing'}`);
  console.log(`   WhatsApp Number  : ${wa ? '✅ Valid' : '❌ Invalid/Missing'}`);
  console.log(`   Admin Phone      : ${ADMIN_PHONE ? '✅ ' + ADMIN_PHONE : '❌ Missing'}`);
  console.log('\n⚠️  NOTE: MSG91_AUTH_KEY value must be the same as set in Vercel.');
  console.log('   To test Vercel values: add them to .env temporarily, then re-run.\n');
}

runAll();

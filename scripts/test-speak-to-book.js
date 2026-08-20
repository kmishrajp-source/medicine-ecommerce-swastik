const http = require('http');

async function testAPI(transcript, label, expectedIntent, userId = 'test-user-1') {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      transcript: transcript,
      detectedLang: 'en-IN',
      userId: userId
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/speech/recognize',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'X-Test-Mode': 'true' // Custom header to tell API to use TEST_MODE
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log(`\n[TEST] ${label}`);
        console.log(`Input: "${transcript}"`);
        let pass = true;
        try {
          const parsed = JSON.parse(body);
          if (parsed.intent !== expectedIntent) {
            pass = false;
            console.error(`  [FAIL] Expected Intent: ${expectedIntent}, Got: ${parsed.intent}`);
          }
          if (expectedIntent === "BOOKING_CONFIRMED" && (!parsed.data?.bookingId || !parsed.data.bookingId.startsWith('TEST-'))) {
            pass = false;
            console.error(`  [FAIL] Booking ID not generated or invalid. Data:`, parsed.data);
          }
          if (pass) {
            console.log(`  [PASS] ${parsed.data?.message || parsed.message || parsed.intent}`);
          }
        } catch(e) {
          console.error(`  [FAIL] JSON Parse Error:`, body.slice(0, 100));
          pass = false;
        }
        resolve(pass);
      });
    });

    req.on('error', (e) => {
      console.log(`\nERROR for "${label}":`, e.message);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log("========================================");
  console.log("   SWASTIK VOICE AI BOOKING QA SUITE");
  console.log("========================================\n");

  const testCases = [
    { name: "TEST 001 - Physical Doctor Booking", transcript: "Book a lung specialist tomorrow afternoon. Yes book it.", expectedIntent: "BOOKING_CONFIRMED" },
    { name: "TEST 002 - Online Doctor Booking", transcript: "Find me an online dermatologist. Yes book it.", expectedIntent: "BOOKING_CONFIRMED" },
    { name: "TEST 003 - Lab Booking", transcript: "Book a CBC test tomorrow morning. Yes book it.", expectedIntent: "BOOKING_CONFIRMED" },
    { name: "TEST 004 - Ambulance Booking", transcript: "I need an ambulance. Book it.", expectedIntent: "BOOKING_CONFIRMED" },
    { name: "TEST 005 - Emergency Escalation", transcript: "I am having severe difficulty breathing.", expectedIntent: "EMERGENCY_ESCALATION" },
    { name: "TEST 006 - Unauthenticated User", transcript: "Book a doctor.", expectedIntent: "AUTH_REQUIRED", userId: null }
  ];

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    const isPass = await testAPI(tc.transcript, tc.name, tc.expectedIntent, tc.userId);
    if (isPass) passed++;
    else failed++;
  }

  console.log(`\nTESTS COMPLETED. Passed: ${passed} | Failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

runTests();

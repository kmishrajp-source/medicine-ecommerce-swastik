const https = require('https');

async function testAPI(transcript, label) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      transcript: transcript,
      detectedLang: 'en-IN',
      userId: 'test-user-123'
    });

    const options = {
      hostname: 'medicine-ecommerce-swastik.vercel.app',
      path: '/api/speech/recognize',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('\n========================================');
        console.log(`TEST: ${label}`);
        console.log(`Transcript: "${transcript}"`);
        console.log(`Status: ${res.statusCode}`);
        try {
          const parsed = JSON.parse(body);
          console.log('Intent:', parsed.intent);
          console.log('Message:', parsed.data?.message || parsed.message || '(no message)');
          console.log('Show Upload Rx:', parsed.data?.showUploadUI || false);
          console.log('Show Confirm UI:', parsed.data?.showConfirmUI || false);
          console.log('Show Payment UI:', parsed.data?.showPaymentUI || false);
        } catch(e) {
          console.log('Raw Response:', body.slice(0, 500));
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`\nERROR for "${label}":`, e.message);
      resolve();
    });

    req.write(data);
    req.end();
  });
}

async function run() {
  // Test 1: OTC Medicine — should show price confirmation
  await testAPI('I want to buy Crocin 500mg', 'OTC Medicine Test (Crocin)');

  // Test 2: Rx Medicine — should request prescription upload
  await testAPI('Give me Alprazolam 0.5mg', 'Prescription Medicine Test (Alprazolam)');

  // Test 3: General buy — should identify and proceed
  await testAPI('I need paracetamol tablets', 'OTC Generic Test (Paracetamol)');
}

run().then(() => {
  console.log('\n========================================');
  console.log('All tests completed.');
});

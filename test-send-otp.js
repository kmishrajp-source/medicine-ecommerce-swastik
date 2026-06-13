const https = require('https');

function post(url, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
                catch(e) { resolve({ status: res.statusCode, data: body }); }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function main() {
    console.log("Sending OTP request to production...");
    const res = await post(
        'https://medicine-ecommerce-swastik.vercel.app/api/auth/send-otp',
        { phone: '9999999999' }
    );
    console.log("Response:", JSON.stringify(res, null, 2));
}

main().catch(console.error);

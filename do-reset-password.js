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
    console.log('Step 1: Requesting reset token for admin email...');
    const forgotRes = await post(
        'https://medicine-ecommerce-swastik.vercel.app/api/auth/forgot-password',
        { email: 'swastikmedicare.help@gmail.com' }
    );
    console.log('Forgot password response:', JSON.stringify(forgotRes, null, 2));

    if (forgotRes.data && forgotRes.data.resetLink) {
        const resetLink = forgotRes.data.resetLink;
        const token = new URL(resetLink).searchParams.get('token');
        console.log('\nStep 2: Got token:', token);
        console.log('Reset link:', resetLink);

        console.log('\nStep 3: Setting new password...');
        const resetRes = await post(
            'https://medicine-ecommerce-swastik.vercel.app/api/auth/reset-password',
            { token: token, newPassword: 'Pranshu@2007' }
        );
        console.log('Reset password response:', JSON.stringify(resetRes, null, 2));
    } else {
        console.log('ERROR: No resetLink in response. Cannot proceed.');
    }
}

main().catch(console.error);

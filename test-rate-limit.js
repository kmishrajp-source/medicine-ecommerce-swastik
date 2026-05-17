const fetch = require('node-fetch');

async function testRateLimit() {
    const url = 'http://localhost:3000/api/create-cod-order';
    console.log(`Testing rate limit on ${url}...`);
    
    for (let i = 1; i <= 20; i++) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                body: JSON.stringify({ test: true }),
                headers: { 'Content-Type': 'application/json' }
            });
            console.log(`Request ${i}: Status ${res.status}`);
            if (res.status === 429) {
                console.log('Rate limit hit!');
                break;
            }
        } catch (e) {
            console.log(`Request ${i}: Failed (Server probably not running)`);
            break;
        }
    }
}

testRateLimit();

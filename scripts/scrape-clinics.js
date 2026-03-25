const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function scrapeClinics() {
    const url = 'https://www.doctoriduniya.com/gorakhpur/clinics';
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
    };

    console.log(`Connecting to ${url}...`);

    try {
        const response = await axios.get(url, { headers, timeout: 15000, maxRedirects: 15 });
        const html = response.data;
        console.log("Successfully fetched HTML content.");
        
        // Basic extraction logic (Regex based for speed, or just write to temp for further processing)
        // Since I'm the agent, I'll process the HTML directly or look for patterns.
        
        fs.writeFileSync(path.join(__dirname, 'doctoriduniya_raw.html'), html);
        console.log("Raw HTML saved to doctoriduniya_raw.html");

    } catch (error) {
        console.error("Failed to fetch data:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
        }
    }
}

scrapeClinics();

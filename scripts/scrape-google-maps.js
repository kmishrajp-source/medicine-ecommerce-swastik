const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * Healthcare Scraper for Google Maps (Gorakhpur Focus)
 * Usage: node scripts/scrape-google-maps.js "Doctors in Gorakhpur"
 */

async function scrapeGoogleMaps(query = "Doctors in Gorakhpur") {
    console.log(`🚀 Starting scraper for: ${query}`);
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Go to Google Maps
    await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(query)}`);
    
    // Wait for results to load
    try {
        await page.waitForSelector('.m67q60-a61331-a', { timeout: 10000 });
    } catch (e) {
        console.log("⚠️ Results container not found or timeout. Retrying with scroll...");
    }

    const results = [];
    let lastHeight = 0;
    
    // Scroll to load more results (Google Maps uses infinite scroll)
    for (let i = 0; i < 5; i++) {
        await page.mouse.wheel(0, 5000);
        await page.waitForTimeout(2000);
    }

    // Extract data
    const entries = await page.$$('.Nv2pk'); // Selector for search result items
    
    for (const entry of entries) {
        try {
            const name = await entry.$eval('.qBF1Pd', el => el.innerText).catch(() => 'Unknown');
            const rating = await entry.$eval('.MW4Y7e', el => el.innerText).catch(() => 'N/A');
            const reviews = await entry.$eval('.UY7F9', el => el.innerText).catch(() => '0');
            const address = await entry.$eval('.W4Efsd:nth-child(2) > .W4Efsd:nth-child(2)', el => el.innerText).catch(() => 'N/A');
            const phone = await entry.$eval('.Us7ffb', el => el.innerText).catch(() => 'N/A');

            results.push({
                name,
                rating,
                reviews: reviews.replace(/[()]/g, ''),
                address,
                phone,
                type: query.toLowerCase().includes('doctor') ? 'DOCTOR' : 
                      query.toLowerCase().includes('hospital') ? 'HOSPITAL' : 
                      query.toLowerCase().includes('pharmacy') ? 'RETAILER' : 'OTHER',
                source: 'google_maps',
                city: 'Gorakhpur'
            });
        } catch (e) {
            // Skip problematic entries
        }
    }

    await browser.close();

    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `leads_${query.replace(/\s+/g, '_').toLowerCase()}_${timestamp}.json`;
    const filePath = path.join(__dirname, '..', 'tmp', fileName);
    
    if (!fs.existsSync(path.join(__dirname, '..', 'tmp'))) {
        fs.mkdirSync(path.join(__dirname, '..', 'tmp'));
    }

    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
    
    console.log(`✅ Scraped ${results.length} leads.`);
    console.log(`📄 Results saved to: ${filePath}`);
    
    return results;
}

const query = process.argv[2] || "Doctors in Gorakhpur";
scrapeGoogleMaps(query);

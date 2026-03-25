const { execSync } = require('child_process');
const path = require('path');

async function runGrowthLoop() {
    console.log("🔄 Starting Swastik Medicare Growth Loop...");
    console.log("===========================================");

    const scripts = [
        'scrape-clinics.js',
        'dedupe-leads.js',
        'process-new-leads.js',
        'follow-up-cron.js'
    ];

    for (const script of scripts) {
        console.log(`\n▶️ Running ${script}...`);
        try {
            const output = execSync(`node ${path.join(__dirname, script)}`, { encoding: 'utf-8' });
            console.log(output);
        } catch (error) {
            console.error(`❌ Error running ${script}:`, error.message);
            // We continue to next script to ensure some part of the loop always runs
        }
    }

    console.log("\n===========================================");
    console.log("✅ Growth Loop Run Completed.");
}

runGrowthLoop();

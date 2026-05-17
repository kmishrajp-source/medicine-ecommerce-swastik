const fetch = require('node-fetch');

async function callStep(step) {
    console.log(`\n[STEP: ${step}] Starting...`);
    try {
        const res = await fetch(
            `http://localhost:3000/api/restore-data?secret=swastik_restore_2026&step=${step}`,
            { method: 'GET', timeout: 300000 }
        );
        const data = await res.json();
        if (data.success) {
            console.log(`[STEP: ${step}] ✅ OK!`, JSON.stringify(data.restored || data.message));
        } else {
            console.error(`[STEP: ${step}] ❌ Failed:`, data.error);
        }
        return data;
    } catch (e) {
        console.error(`[STEP: ${step}] ❌ Error:`, e.message);
        return null;
    }
}

async function main() {
    console.log('🚀 SWASTIK MEDICARE - CALLING RESTORE API...\n');
    await callStep('hospitals');
    await callStep('doctors');
    await callStep('retailers');
    await callStep('medicines');
    console.log('\n✅ ALL STEPS COMPLETED!');
}

main();

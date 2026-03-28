const fetch = require('node-fetch');

async function testDirectorySystem() {
    const baseUrl = 'http://localhost:3000'; // Assuming local dev server
    console.log("--- 🧪 Starting Directory System Verification ---");

    try {
        // 1. Test Bulk Upload (Doctor)
        console.log("1. Testing Bulk Upload (Doctor)...");
        const bulkRes = await fetch(`${baseUrl}/api/admin/bulk-upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'doctor',
                data: [
                    { name: "Dr. Test Verify", phone: "9000000001", specialization: "Testing", hospital: "Lab", source: "google_maps" }
                ]
            })
        });
        const bulkData = await bulkRes.json();
        console.log("Bulk Upload Result:", bulkData);

        // 2. Test Agent Add Entry (Retailer)
        console.log("2. Testing Agent Add Entry (Retailer)...");
        const agentAddRes = await fetch(`${baseUrl}/api/agent/add-entry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'retailer',
                shopName: "Verify Pharmacy",
                phone: "9000000002",
                address: "Test St, Delhi",
                lat: 28.1234,
                lng: 77.1234
            })
        });
        const agentAddData = await agentAddRes.json();
        console.log("Agent Add Result:", agentAddData);

        // 3. Test Agent Directory Listing
        console.log("3. Testing Agent Directory Listing...");
        const listRes = await fetch(`${baseUrl}/api/agent/directory?type=doctor`);
        const listData = await listRes.json();
        console.log("Doctor List Result Count:", listData.data?.length);

        console.log("\n--- ✅ Verification Steps Completed ---");
        console.log("Note: If the server is not running, these tests will fail. Run 'npm run dev' first.");
    } catch (error) {
        console.error("❌ Verification Failed:", error.message);
    }
}

testDirectorySystem();


import fs from 'fs';
import path from 'path';

// CONFIGURATION
const WEBSITE_URL = "https://medicine-ecommerce-swastik.vercel.app"; // Update if your domain is different
const TALLY_URL = "http://localhost:9000";
const API_ENDPOINT = `${WEBSITE_URL}/api/admin/orders`;

console.log("==========================================");
console.log("      Swastik Medicare -> Tally Sync      ");
console.log("==========================================");
console.log(`Fetching orders from: ${WEBSITE_URL}`);
console.log(`Pushing to Tally at: ${TALLY_URL}`);
console.log("------------------------------------------");

async function syncToTally() {
    try {
        // 1. Fetch Orders from Website
        console.log("Step 1: Fetching orders...");
        const response = await fetch(API_ENDPOINT);

        if (!response.ok) {
            throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success || !data.orders) {
            throw new Error("Invalid response from website API");
        }

        const orders = data.orders;
        console.log(`Found ${orders.length} orders.`);

        if (orders.length === 0) {
            console.log("No orders to sync.");
            return;
        }

        // 2. Generate XML and Push to Tally
        console.log("Step 2: Pushing to Tally...");

        let successCount = 0;
        let failCount = 0;

        for (const order of orders) {
            // Check if already synced? (Ideally we need a flag, but for now we push all)
            // Tally will usually reject duplicates if VoucherNumber matches, or prompt.
            // We'll trust Tally's duplicate detection or user's discretion.

            const xml = generateTallyXML(order);

            try {
                const tallyRes = await fetch(TALLY_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/xml' },
                    body: xml
                });

                const tallyText = await tallyRes.text();

                if (tallyText.includes("<CREATED>1</CREATED>") || tallyText.includes("<ALTERED>1</ALTERED>") || tallyText.includes("created successfully")) {
                    console.log(`[OK] Order #${order.id.slice(-6)} synced.`);
                    successCount++;
                } else {
                    // Tally often returns 200 even on error, with error details in body
                    if (tallyText.includes("<ERRORS>0</ERRORS>")) {
                        console.log(`[OK] Order #${order.id.slice(-6)} synced (No errors).`);
                        successCount++;
                    } else {
                        console.error(`[FAIL] Order #${order.id.slice(-6)}: Tally rejected it.`);
                        console.error("Tally Response Preview:", tallyText.slice(0, 200));
                        failCount++;
                    }
                }
            } catch (err) {
                console.error(`[FAIL] Order #${order.id.slice(-6)}: Connection error to Tally.`);
                failCount++;
            }
        }

        console.log("------------------------------------------");
        console.log(`Sync Complete.`);
        console.log(`Success: ${successCount}`);
        console.log(`Failed:  ${failCount}`);

    } catch (error) {
        console.error("\nCRITICAL ERROR:", error.message);
        console.log("\nPossible causes:");
        console.log("1. Website is down or URL is wrong.");
        console.log("2. Tally is not running.");
        console.log("3. Tally is running but 'Client/Server' access is not enabled (Check Tally Config).");
    }
}

// Re-implemented XML generator for single order
function generateTallyXML(order) {
    const dateObj = new Date(order.date);
    const dateStr = dateObj.toISOString().slice(0, 10).replace(/-/g, "");
    const partyName = order.customer ? order.customer.replace(/&/g, "&amp;") : "Cash Provider";

    return `<ENVELOPE>
    <HEADER>
        <TALLYREQUEST>Import Data</TALLYREQUEST>
    </HEADER>
    <BODY>
        <IMPORTDATA>
            <REQUESTDESC>
                <REPORTNAME>Vouchers</REPORTNAME>
                <STATICVARIABLES>
                    <SVCURRENTCOMPANY>Swastik Medicare</SVCURRENTCOMPANY>
                </STATICVARIABLES>
            </REQUESTDESC>
            <REQUESTDATA>
                <TALLYMESSAGE xmlns:UDF="TallyUDF">
                    <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Accounting Voucher View">
                        <DATE>${dateStr}</DATE>
                        <NARRATION>Order ID: ${order.id} - ${order.items.replace(/&/g, "&amp;")}</NARRATION>
                        <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
                        <VOUCHERNUMBER>${order.id.slice(-6)}</VOUCHERNUMBER>
                        <PARTYLEDGERNAME>${partyName}</PARTYLEDGERNAME>
                        <FBTPAYMENTTYPE>Default</FBTPAYMENTTYPE>
                        <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
                        <ALLLEDGERENTRIES.LIST>
                            <LEDGERNAME>${partyName}</LEDGERNAME>
                            <ISDEEMEDPOSITIVE>Bs</ISDEEMEDPOSITIVE>
                            <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
                            <AMOUNT>-${order.total}</AMOUNT>
                        </ALLLEDGERENTRIES.LIST>
                        <ALLLEDGERENTRIES.LIST>
                            <LEDGERNAME>Sales Account</LEDGERNAME>
                            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                            <ISPARTYLEDGER>No</ISPARTYLEDGER>
                            <AMOUNT>${order.total}</AMOUNT>
                        </ALLLEDGERENTRIES.LIST>
                    </VOUCHER>
                </TALLYMESSAGE>
            </REQUESTDATA>
        </IMPORTDATA>
    </BODY>
</ENVELOPE>`;
}

syncToTally();

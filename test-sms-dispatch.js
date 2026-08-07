// test-sms-dispatch.js
// Custom verification and simulation of Swastik Medicare's multi-party SMS and referral logic.

const TEST_PHONE = "9161364908"; // User's phone number for testing
const ADMIN_PHONE = "9161364908"; // Hardcoded Admin phone

// Mock product data for dummy checkout
const MOCK_CART = [
    { id: "prod-rx-123", name: "Amoxicillin 500mg", price: 250.00, quantity: 2, requiresPrescription: true },
    { id: "prod-otc-456", name: "Paracetamol 650mg", price: 50.00, quantity: 3, requiresPrescription: false }
];
const MOCK_ADDRESS = "123 Swastik Enclave, Medical Road, Gorakhpur, UP";

// 1. Core SMS Sender Logic (Duplicated from lib/sms.js for standalone Node support)
function simulateSendSMS(phone, message, templateId = null) {
    // Normalize phone number
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    console.log("\n=================================================================================");
    console.log(`📡 [MOCK MSG91 SMS GATEWAY]`);
    console.log(`📱 To: +${cleanPhone}`);
    if (templateId) console.log(`🏷️ Template ID (DLT Compliance): ${templateId}`);
    console.log(`✉️ Message Content:\n------------------------------------------------------------\n${message}\n------------------------------------------------------------`);
    console.log("=================================================================================\n");

    return { success: true, mock: true };
}

// 2. Hyperlocal Distance Calculator (Haversine formula from utils/routing.js)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// 3. Referral Commission Engine (Simulated from utils/referrals.js)
function simulateCommissions(userId, buyerName, orderTotal, referrerCode) {
    console.log(`\n💸 [MONEY ENGINE] Calculating Multi-Level commissions for order total: ₹${orderTotal.toFixed(2)}`);
    
    // Assume flat 20% gross medicine margin
    const estimatedMargin = orderTotal * 0.20;
    console.log(`📦 Assumed Pharmacy Margin (20%): ₹${estimatedMargin.toFixed(2)}`);

    // Level 1: 5% of Margin
    const level1Amount = Math.max(0.01, parseFloat((estimatedMargin * 0.05).toFixed(2)));
    // Level 2: 2% of Margin
    const level2Amount = Math.max(0.01, parseFloat((estimatedMargin * 0.02).toFixed(2)));

    console.log(`🟢 [LEVEL 1 COMMISSION] Credited ₹${level1Amount.toFixed(2)} (5% of margin) to Referrer (Code: ${referrerCode})`);
    console.log(`    ↳ Wallet Entry: "Level 1 Commission (5% of Margin) from ${buyerName}'s Order"`);
    
    console.log(`🔵 [LEVEL 2 COMMISSION] Credited ₹${level2Amount.toFixed(2)} (2% of margin) to Extended Network Referrer`);
    console.log(`    ↳ Wallet Entry: "Level 2 Commission (2% of Margin) from Extended Network Order"`);
}

// Run the full dummy verification workflow
async function runVerification() {
    console.log("🚀 STARTING DUMMY WORKFLOW SIMULATION FOR SWASTIK MEDICARE");
    console.log(`📍 Testing with Phone Number: +91 ${TEST_PHONE}`);
    console.log("---------------------------------------------------------------------------------");

    // PHASE 1: User Registration OTP
    console.log("\n🎬 STAGE 1: Dummy User Registration / Verification Request");
    const dummyOtp = Math.floor(100000 + Math.random() * 900000).toString();
    simulateSendSMS(
        TEST_PHONE,
        `Swastik Medicare: Your verification code is ${dummyOtp}. Valid for 5 minutes.`
    );

    // PHASE 2: Dummy Medicine Checkout Flow
    console.log("\n🎬 STAGE 2: Medicine Order Checkout (Online Payment Success)");
    const orderTotal = MOCK_CART.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shortOrderId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();

    // 2A. Send SMS to Buyer
    simulateSendSMS(
        TEST_PHONE,
        `Dear Customer, your order from Swastik Medicare has been billed successfully.\n\nInvoice No: SM${shortOrderId}\nAmount: ₹${orderTotal.toFixed(2)}\nStatus: Confirmed\nDelivery Code: ${deliveryCode}\n\nInvoice sent to your email.\nThank you for trusting Swastik Medicare.`
    );

    // 2B. Send SMS to Admin
    simulateSendSMS(
        ADMIN_PHONE,
        `New Order Received! ID: #SM${shortOrderId}, Amt: ₹${orderTotal.toFixed(2)}, Customer: Dummy Buyer. Check Admin Dashboard.`
    );

    // PHASE 3: Hyperlocal Pharmacy Routing (5km Radius cutoff)
    console.log("\n🎬 STAGE 3: Hyperlocal Pharmacy Routing & Assign");
    const buyerLocation = { lat: 26.7606, lng: 83.3731 }; // Gorakhpur Coordinates
    const mockRetailers = [
        { id: "ret-1", shopName: "Apollo Pharmacy Gorakhpur", phone: "9876543211", lat: 26.7590, lng: 83.3750 }, // 0.25 km away
        { id: "ret-2", shopName: "Durga Medicos", phone: "9876543212", lat: 26.7800, lng: 83.4100 } // 4.3 km away
    ];

    console.log("🔍 Scanning for online pharmacies within 5km radius...");
    const matchedRetailers = mockRetailers.map(ret => {
        const dist = getDistanceFromLatLonInKm(buyerLocation.lat, buyerLocation.lng, ret.lat, ret.lng);
        return { ...ret, distance: dist };
    }).filter(ret => ret.distance <= 5.0)
      .sort((a, b) => a.distance - b.distance);

    if (matchedRetailers.length > 0) {
        const primaryPharmacy = matchedRetailers[0];
        console.log(`✅ Fulfilling Pharmacy Found: "${primaryPharmacy.shopName}" (${primaryPharmacy.distance.toFixed(2)} km away)`);
        
        // Fulfill Alert sent to Pharmacy
        simulateSendSMS(
            primaryPharmacy.phone,
            `Swastik Medicare: New Medicine Order #SM${shortOrderId} received! Please check your Retailer Dashboard to accept within 60 seconds.`
        );

        // PHASE 4: Transporter Assignment (10km Radius cutoff from Pharmacy)
        console.log("\n🎬 STAGE 4: Hyperlocal Transporter (Delivery Agent) Assign");
        const mockDrivers = [
            { id: "drv-1", name: "Ramesh Rider", phone: "9988776655", lat: 26.7580, lng: 83.3740 } // 0.15 km from Pharmacy
        ];

        console.log(`🔍 Scanning online drivers within 10km radius of "${primaryPharmacy.shopName}"...`);
        const primaryDriver = mockDrivers[0]; // Nearest driver
        const driverDist = getDistanceFromLatLonInKm(primaryPharmacy.lat, primaryPharmacy.lng, primaryDriver.lat, primaryDriver.lng);
        
        console.log(`✅ Nearest Transporter Found: "${primaryDriver.name}" (${driverDist.toFixed(2)} km from pickup)`);
        
        // Assignment Alert sent to Transporter
        simulateSendSMS(
            primaryDriver.phone,
            `Swastik Medicare: New Delivery Assignment! Order #SM${shortOrderId}. Pickup from ${primaryPharmacy.shopName}. Please open your Driver App to view directions.`
        );

        // PHASE 5: Delivery Completion and Bounty Releases
        console.log("\n🎬 STAGE 5: Order Delivery & Referral Engine Credit");
        console.log(`🛵 Transporter "${primaryDriver.name}" marks order #SM${shortOrderId} as "DELIVERED" via app...`);

        // release escrow welcome bonuses
        const welcomeBonus = 50.00;
        const referralBounty = 50.00;
        const referrerCode = "REF-SW-99";

        console.log("\n🔥 [ESCROW RELEASED] First-Order Verified!");
        console.log(`🎁 [WELCOME BONUS] Credited ₹${welcomeBonus.toFixed(2)} to dummy customer's wallet balance!`);
        console.log(`    ↳ Wallet Entry: "Welcome Bonus (First Order Completed)"`);
        console.log(`🎁 [REFERRAL BOUNTY] Credited ₹${referralBounty.toFixed(2)} to Referrer (Code: ${referrerCode})!`);
        console.log(`    ↳ Wallet Entry: "Referral Bonus for inviting Dummy Buyer"`);

        // Trigger MLM Margin Commissions
        simulateCommissions("buyer-123", "Dummy Buyer", orderTotal, referrerCode);

    } else {
        console.log("❌ No online pharmacies found within 5km radius of buyer.");
    }

    console.log("\n---------------------------------------------------------------------------------");
    console.log("🎉 VERIFICATION WORKFLOW SIMULATION COMPLETE!");
    console.log("=================================================================================");
}

runVerification();

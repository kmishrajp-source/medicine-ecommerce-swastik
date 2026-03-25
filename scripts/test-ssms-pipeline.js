/**
 * SSMS Pipeline Verification Script
 * Tests: Lead Creation -> Agent Contact -> Payment Simulation -> Conversion -> Directory Activation
 */
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function runTest() {
    console.log("🚀 Starting SSMS Pipeline Test...");

    // 1. Create a Test Lead
    const testLead = await prisma.lead.create({
        data: {
            guestName: "Dr. Test Pipeline",
            guestPhone: "9876543210",
            serviceType: "doctor",
            area: "Gorakhpur North",
            source: "pipeline_test",
            status: "new",
            planType: "featured",
            amount: 4999
        }
    });
    console.log(`✅ Step 1: Lead Created (ID: ${testLead.id})`);

    // 2. Simulate Agent Update (INTERESTED)
    // This should trigger SSMSAutomation.onStatusChange
    // Since we are in a script, we'll call the logic directly if possible, 
    // but here we just update DB to see state.
    await prisma.lead.update({
        where: { id: testLead.id },
        data: { status: 'interested', notes: 'Very interested in Featured plan.' }
    });
    console.log(`✅ Step 2: Status updated to INTERESTED`);

    // 3. Simulate Payment Success (via our Automation helper)
    // In real life, this comes from the Razorpay Webhook
    const { SSMSAutomation } = await import('../lib/ssms-automation.js');
    await SSMSAutomation.handlePaymentSuccess(testLead.id, "pay_mock_12345");
    console.log(`✅ Step 3: Payment Success Handled (Status -> CONVERTED)`);

    // 4. Verify Directory Activation
    const doctor = await prisma.doctor.findFirst({
        where: { phone: "9876543210" }
    });
    
    if (doctor && doctor.verified && doctor.status === 'verified') {
        console.log(`✅ Step 4: Doctor Profile Activated in Directory!`);
        console.log(`🎉 SSMS Pipeline Verified Successfully!`);
    } else {
        console.error(`❌ Step 4: Doctor Profile NOT activated.`);
    }

    await prisma.$disconnect();
}

runTest().catch(err => {
    console.error("Test Failed:", err);
    process.exit(1);
});

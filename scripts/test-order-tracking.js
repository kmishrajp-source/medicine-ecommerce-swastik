const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch'); // using built-in fetch if node 18+ but requires syntax depending on node version. We'll use Prisma for DB directly and node 18 fetch.
const prisma = new PrismaClient();

const API_BASE = 'http://localhost:3000/api';

async function logResult(testId, name, expected, actual, passed, reason = '') {
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testId} - ${name}`);
    if (!passed) {
        console.log(`  Expected: ${expected}`);
        console.log(`  Actual: ${actual}`);
        if (reason) console.log(`  Reason: ${reason}`);
    }
}

async function runTests() {
    console.log("=== STARTING SWASTIK MEDICARE TRACKING QA ===");
    let orderId = null;

    try {
        // Setup: Create a dummy order
        const user = await prisma.user.upsert({
            where: { email: 'testcustomer@example.com' },
            update: {},
            create: { email: 'testcustomer@example.com', password: 'test', name: 'QA Customer' }
        });

        const order = await prisma.order.create({
            data: {
                userId: user.id,
                total: 100,
                status: 'Received',
                address: '123 QA Street, Gorakhpur',
                lat: 26.76,
                lng: 83.37,
                isPaid: true
            }
        });
        orderId = order.id;

        // TEST 001 - Order created
        logResult('TEST 001', 'Order created', 'Received', order.status, order.status === 'Received');

        // TEST 004 - Delivery partner assigned
        const assignRes = await fetch(`${API_BASE}/admin/simulate-tracking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-test-mode': 'true' },
            body: JSON.stringify({ action: 'assign', orderId })
        });
        const assignData = await assignRes.json();
        logResult('TEST 004', 'Partner assigned', true, assignData.success, assignData.success === true);

        // Verify status changed
        const orderAssigned = await prisma.order.findUnique({ where: { id: orderId } });
        logResult('TEST 005', 'Status updated to Out_for_Delivery', 'Out_for_Delivery', orderAssigned.status, orderAssigned.status === 'Out_for_Delivery');

        // TEST 006 - Partner location update
        const locRes = await fetch(`${API_BASE}/rider/location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-test-mode': 'true' },
            body: JSON.stringify({ lat: 26.75, lng: 83.36, orderId, testAgentId: 'test-agent-123' })
        });
        const locData = await locRes.json();
        logResult('TEST 006', 'Location updated successfully', true, locData.success, locData.success === true);

        // TEST 009 - ETA calculated
        const getLocRes = await fetch(`${API_BASE}/rider/location?orderId=${orderId}`);
        const getLocData = await getLocRes.json();
        const hasEta = getLocData.etaMinutes !== undefined && getLocData.etaMinutes !== null;
        logResult('TEST 009', 'ETA is calculated', true, hasEta, hasEta === true);

        // TEST 013 - Delivery instructions saved
        const instRes = await fetch(`${API_BASE}/orders/tracking/${orderId}/instructions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-test-mode': 'true' },
            body: JSON.stringify({ instructions: 'Leave at door' })
        });
        const instData = await instRes.json();
        logResult('TEST 013', 'Delivery instructions saved', true, instData.success, instData.success === true);

        // TEST 014 - Tip recorded
        const tipRes = await fetch(`${API_BASE}/orders/tracking/${orderId}/tip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-test-mode': 'true' },
            body: JSON.stringify({ amount: 50 })
        });
        const tipData = await tipRes.json();
        logResult('TEST 014', 'Tip recorded', true, tipData.success, tipData.success === true);

        // TEST 017 - Delivery verification
        const otpRes = await fetch(`${API_BASE}/rider/verify-delivery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-test-mode': 'true' },
            body: JSON.stringify({ orderId, otp: '123456' })
        });
        const otpData = await otpRes.json();
        logResult('TEST 017', 'Delivery verification with OTP', true, otpData.success, otpData.success === true);

        // TEST 018 - Order delivered
        const finalOrder = await prisma.order.findUnique({ where: { id: orderId } });
        logResult('TEST 018', 'Order is Delivered', 'Delivered', finalOrder.status, finalOrder.status === 'Delivered');

        // Cleanup
        await prisma.order.delete({ where: { id: orderId } });
        console.log("Cleanup completed.");
    } catch (e) {
        console.error("QA Test Suite Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

runTests();

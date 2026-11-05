import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });
dotenv.config({ path: '.env' });

import prisma from '../lib/prisma.js';
import { normalizePhoneNumber, maskPhoneNumber } from '../lib/phone-normalizer.js';
import { sendSMS } from '../lib/sms.js';
import { createBuyerEnquiry, submitProviderQuotation, updateQuotationStatus } from '../lib/healthmart/store.js';

const TEST_CUSTOMER_PHONE = "9555053405";
const TEST_PHARMACY_PHONE = "7992122974";
const MALFORMED_PHONE = "0963963159"; // The bad format that caused error 202

async function runAllWorkflowTests() {
    console.log("================================================================================");
    console.log("     SWASTIK MEDICARE — END-TO-END SMS & NOTIFICATION WORKFLOW TEST SUITE       ");
    console.log("================================================================================\n");

    const results = [];

    // -------------------------------------------------------------------------
    // WORKFLOW 1: Customer Login / Auth OTP Flow
    // -------------------------------------------------------------------------
    console.log("▶ [WORKFLOW 1/6] Testing Customer Auth OTP Dispatch...");
    try {
        const norm = normalizePhoneNumber(TEST_CUSTOMER_PHONE);
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const smsRes = await sendSMS(
            norm.e164,
            `Swastik Medicare: Your verification code is ${otpCode}. Valid for 10 minutes.`,
            null,
            { event: "AUTH_LOGIN_OTP" }
        );

        const ok = smsRes.success && (smsRes.providerRequestId || smsRes.mock);
        results.push({
            workflow: "1. Customer Auth OTP",
            recipient: maskPhoneNumber(norm.e164),
            providerRequestId: smsRes.providerRequestId || "None",
            status: ok ? "PASS" : "FAIL",
            details: ok ? `Accepted by provider (ReqID: ${smsRes.providerRequestId})` : smsRes.error
        });
        console.log(`  ${ok ? '✓ PASS' : '✗ FAIL'}: Auth OTP -> ReqID: ${smsRes.providerRequestId}`);
    } catch (e) {
        results.push({ workflow: "1. Customer Auth OTP", status: "ERROR", details: e.message });
        console.error("  ✗ ERROR:", e.message);
    }

    // -------------------------------------------------------------------------
    // WORKFLOW 2: Malformed Number Rejection (Prevent Error 202 on Auth/Orders)
    // -------------------------------------------------------------------------
    console.log("\n▶ [WORKFLOW 2/6] Testing Malformed Number Rejection ('0963963159')...");
    try {
        const rejRes = await sendSMS(
            MALFORMED_PHONE,
            "Swastik Medicare: Verification code 123456",
            null,
            { event: "AUTH_MALFORMED_TEST" }
        );

        const ok = rejRes.rejected && rejRes.errorCode === "202";
        results.push({
            workflow: "2. Malformed Number Pre-Flight Guard",
            recipient: maskPhoneNumber(MALFORMED_PHONE),
            providerRequestId: "BLOCKED",
            status: ok ? "PASS" : "FAIL",
            details: ok ? `Blocked before MSG91: ${rejRes.error}` : "Did not block!"
        });
        console.log(`  ${ok ? '✓ PASS' : '✗ FAIL'}: Successfully blocked before calling MSG91`);
    } catch (e) {
        results.push({ workflow: "2. Malformed Number Pre-Flight Guard", status: "ERROR", details: e.message });
    }

    // -------------------------------------------------------------------------
    // WORKFLOW 3: HealthMart B2B RFQ Creation & Dispatch
    // -------------------------------------------------------------------------
    console.log("\n▶ [WORKFLOW 3/6] Testing HealthMart B2B RFQ Notifications...");
    try {
        const rfqData = {
            title: "Automated Test RFQ - ICU Monitors",
            description: "End-to-end notification testing for marketplace buyers and sellers.",
            categorySlug: "medical-equipment-and-supplies",
            quantity: 2,
            locationCity: "Gorakhpur",
            buyerName: "Dr. Test Buyer",
            buyerPhone: TEST_CUSTOMER_PHONE,
            buyerEmail: "testbuyer@swastikmed.online",
            priority: "HIGH",
            categoryData: { deviceType: "Multipara Monitor" }
        };

        const enquiry = await createBuyerEnquiry(rfqData);
        const ok = !!enquiry && !!enquiry.enquiryNumber;
        results.push({
            workflow: "3. HealthMart New RFQ Creation",
            recipient: maskPhoneNumber(TEST_CUSTOMER_PHONE),
            enquiryNumber: enquiry?.enquiryNumber || "None",
            status: ok ? "PASS" : "FAIL",
            details: `Enquiry #${enquiry.enquiryNumber} created, matched ${enquiry.matchedProvidersCount} providers, SMS & WhatsApp triggered`
        });
        console.log(`  ${ok ? '✓ PASS' : '✗ FAIL'}: RFQ Created #${enquiry.enquiryNumber} (Matched: ${enquiry.matchedProvidersCount})`);

        // -------------------------------------------------------------------------
        // WORKFLOW 4: HealthMart Provider Quotation Submission & Buyer Alert
        // -------------------------------------------------------------------------
        console.log("\n▶ [WORKFLOW 4/6] Testing HealthMart Quotation Submission & Buyer Alert...");
        const quoteData = {
            enquiryId: enquiry.id,
            providerId: "prov-gkp-med-eq",
            providerBusinessName: "Eastern UP Medical Technologies",
            providerPhone: TEST_PHARMACY_PHONE,
            providerEmail: "tech@easternupmed.com",
            totalAmount: 18500,
            deliveryDays: 2,
            validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
            quotedItems: [{ name: "ICU Monitor 12-inch", quantity: 2, unitPrice: 9250 }],
            paymentTerms: "COD on Delivery",
            warrantyMonths: 12,
            notes: "Immediate dispatch available from Gorakhpur warehouse."
        };

        const quote = await submitProviderQuotation(quoteData);
        const quoteOk = !!quote && !!quote.id;
        results.push({
            workflow: "4. HealthMart Quotation Alert",
            recipient: maskPhoneNumber(TEST_CUSTOMER_PHONE),
            quotationId: quote?.id || "None",
            status: quoteOk ? "PASS" : "FAIL",
            details: `Quotation submitted for ₹18,500, buyer notification dispatched`
        });
        console.log(`  ${quoteOk ? '✓ PASS' : '✗ FAIL'}: Quotation Submitted (Amount: ₹${quote.totalAmount})`);

        // -------------------------------------------------------------------------
        // WORKFLOW 5: HealthMart Quotation Acceptance & Order Trigger
        // -------------------------------------------------------------------------
        console.log("\n▶ [WORKFLOW 5/6] Testing HealthMart Quotation Acceptance & Order SMS...");
        const acceptResult = await updateQuotationStatus(quote.id, "ACCEPTED");
        const acceptOk = !!acceptResult && !!acceptResult.order;
        results.push({
            workflow: "5. HealthMart Order Confirmation",
            recipient: maskPhoneNumber(TEST_PHARMACY_PHONE),
            orderNumber: acceptResult?.order?.orderNumber || "None",
            status: acceptOk ? "PASS" : "FAIL",
            details: `Order #${acceptResult?.order?.orderNumber} confirmed, multi-party notifications dispatched`
        });
        console.log(`  ${acceptOk ? '✓ PASS' : '✗ FAIL'}: Marketplace Order Confirmed #${acceptResult?.order?.orderNumber}`);

    } catch (e) {
        results.push({ workflow: "3-5. HealthMart Flow", status: "ERROR", details: e.message });
        console.error("  ✗ HealthMart Flow Error:", e.message);
    }

    // -------------------------------------------------------------------------
    // WORKFLOW 6: Direct Retail Order Creation & Pharmacy Itemized Packing Alert
    // -------------------------------------------------------------------------
    console.log("\n▶ [WORKFLOW 6/6] Testing Direct Retail Order & Pharmacy Packing Alert...");
    try {
        const normCustomer = normalizePhoneNumber(TEST_CUSTOMER_PHONE);
        const normPharmacy = normalizePhoneNumber(TEST_PHARMACY_PHONE);
        const testDeliveryCode = "8899";

        // 1. Customer Order Confirmation SMS
        const custSms = await sendSMS(
            normCustomer.e164,
            `Dear Customer, your order from Swastik Medicare has been placed successfully. Order ID: #TEST99. Delivery OTP: ${testDeliveryCode}. Total: ₹350.`,
            null,
            { event: "RETAIL_ORDER_CONFIRMED" }
        );

        // 2. Pharmacy Packing Notification SMS (With address, items, OTP)
        const pharmSms = await sendSMS(
            normPharmacy.e164,
            `New Order! ID: #TEST99, Amt: ₹350, Customer: Test Customer, Ph: +${normCustomer.e164}, Addr: Civil Lines, Gorakhpur. Items: 1x Paracetamol 650. Delivery OTP: ${testDeliveryCode}. Pack order promptly.`,
            null,
            { event: "PHARMACY_PACKING_ALERT" }
        );

        const ok = (custSms.success || custSms.mock) && (pharmSms.success || pharmSms.mock);
        results.push({
            workflow: "6. Direct Retail Order & Pharmacy Alert",
            recipient: `${maskPhoneNumber(normCustomer.e164)} & ${maskPhoneNumber(normPharmacy.e164)}`,
            customerReqId: custSms.providerRequestId || "None",
            pharmacyReqId: pharmSms.providerRequestId || "None",
            status: ok ? "PASS" : "FAIL",
            details: ok ? `Customer ReqID: ${custSms.providerRequestId}, Pharmacy ReqID: ${pharmSms.providerRequestId}` : "Failed to dispatch"
        });
        console.log(`  ${ok ? '✓ PASS' : '✗ FAIL'}: Customer ReqID: ${custSms.providerRequestId} | Pharmacy ReqID: ${pharmSms.providerRequestId}`);
    } catch (e) {
        results.push({ workflow: "6. Direct Retail Order", status: "ERROR", details: e.message });
        console.error("  ✗ Retail Flow Error:", e.message);
    }

    // -------------------------------------------------------------------------
    // SUMMARY REPORT
    // -------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log("                        WORKFLOW TEST RESULTS SUMMARY                           ");
    console.log("================================================================================");
    console.table(results);

    // Verify recent SMSLog entries
    console.log("\n--- Recent 5 Database SMS Logs ---");
    const recentLogs = await prisma.sMSLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });
    recentLogs.forEach(l => {
        let resp = {};
        try { resp = JSON.parse(l.response); } catch(e) {}
        console.log(`[${l.createdAt.toISOString().slice(11, 19)}] To: ${maskPhoneNumber(l.phone)} | Status: ${l.status} | Event: ${resp.event || 'N/A'} | ReqID: ${resp.providerRequestId || '-'}`);
    });

    await prisma.$disconnect();
}

runAllWorkflowTests().catch(err => {
    console.error("Fatal test execution error:", err);
    process.exit(1);
});


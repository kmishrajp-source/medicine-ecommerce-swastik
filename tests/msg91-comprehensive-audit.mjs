import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.production' });

import { normalizePhoneNumber, maskPhoneNumber } from '../lib/phone-normalizer.js';
import { sendSMS, MSG91_ERROR_MAP } from '../lib/sms.js';

async function runComprehensiveTests() {
    console.log("==============================================================");
    console.log("       SWASTIK MEDICARE — MSG91 COMPREHENSIVE TEST SUITE      ");
    console.log("==============================================================\n");

    // ------------------------------------------------------------------
    // PART 1: CONTROLLED UNIT VALIDATION & NORMALIZATION TESTS
    // ------------------------------------------------------------------
    console.log("--- PART 1: Controlled Normalization & Edge-Case Tests ---");
    const testCases = [
        { input: "9555053405", expectedValid: true, expectedE164: "919555053405", desc: "Valid Indian 10-digit" },
        { input: "+91 95550 53405", expectedValid: true, expectedE164: "919555053405", desc: "Valid +91 with spaces" },
        { input: "+91-95550-53405", expectedValid: true, expectedE164: "919555053405", desc: "Valid +91 with hyphens" },
        { input: "09555053405", expectedValid: true, expectedE164: "919555053405", desc: "Valid with leading trunk 0" },
        { input: "0963963159", expectedValid: false, desc: "Trunk 0 + only 9 digits (Root cause of Error 202)" },
        { input: "910963963159", expectedValid: false, desc: "12 digits with 910 prefix" },
        { input: "987654321", expectedValid: false, desc: "Missing digits (9 digits)" },
        { input: "9876abc543", expectedValid: false, desc: "Alphabetic characters" },
        { input: "", expectedValid: false, desc: "Empty number string" },
        { input: null, expectedValid: false, desc: "Null database field" },
        { input: undefined, expectedValid: false, desc: "Undefined variable" },
        { input: "+1 415 555 2671", expectedValid: true, expectedE164: "14155552671", desc: "International number with country code (+1 USA)" },
        { input: "+977 980 123 4567", expectedValid: true, expectedE164: "9779801234567", desc: "International number with country code (+977 Nepal)" }
    ];

    let unitPassed = 0;
    for (const tc of testCases) {
        const res = normalizePhoneNumber(tc.input);
        const validMatch = res.isValid === tc.expectedValid;
        const e164Match = !tc.expectedValid || res.e164 === tc.expectedE164;
        if (validMatch && e164Match) {
            unitPassed++;
            console.log(`  ✓ PASS: ${tc.desc} -> Result: ${res.isValid ? 'Valid (' + res.e164 + ')' : 'Rejected (' + res.reason + ')'}`);
        } else {
            console.error(`  ✗ FAIL: ${tc.desc} -> Expected: ${tc.expectedValid}, Got: ${res.isValid}`);
        }
    }
    console.log(`Part 1 Result: ${unitPassed}/${testCases.length} Unit Tests Passed.\n`);

    // ------------------------------------------------------------------
    // PART 2: PRE-FLIGHT REJECTION TEST (Prevent Error 202 API Submission)
    // ------------------------------------------------------------------
    console.log("--- PART 2: Pre-Flight Gateway Call Prevention ---");
    console.log("Testing whether an invalid number ('0963963159') is safely blocked before hitting MSG91 API...");
    const preflightResult = await sendSMS("0963963159", "Test message", null, { event: "TEST_REJECTION" });
    if (preflightResult.rejected && preflightResult.errorCode === "202") {
        console.log(`  ✓ PASS: Pre-flight blocked invalid number without making external API call!`);
        console.log(`    Error returned: "${preflightResult.error}"`);
        console.log(`    Masked Recipient: ${preflightResult.maskedRecipient}`);
    } else {
        console.error(`  ✗ FAIL: Pre-flight did not reject invalid number! Result:`, preflightResult);
    }

    // ------------------------------------------------------------------
    // PART 3: SIMULATED ERROR CODE MAPPING TEST
    // ------------------------------------------------------------------
    console.log("\n--- PART 3: Provider Error Code Mapping ---");
    console.log(`  202 -> ${MSG91_ERROR_MAP["202"]}`);
    console.log(`  203 -> ${MSG91_ERROR_MAP["203"]}`);
    console.log(`  207 -> ${MSG91_ERROR_MAP["207"]}`);
    console.log(`  301 -> ${MSG91_ERROR_MAP["301"]}`);
    console.log(`  401 -> ${MSG91_ERROR_MAP["401"]}`);

    // ------------------------------------------------------------------
    // PART 4: ACTUAL PROVIDER TEST (Controlled Admin Test Number)
    // ------------------------------------------------------------------
    console.log("\n--- PART 4: Actual Provider Request to MSG91 ---");
    const testAdminNumber = "9555053405"; // The user's active mobile number
    console.log(`Sending controlled test SMS to authorized test number: ${maskPhoneNumber(testAdminNumber)}...`);

    const realResult = await sendSMS(
        testAdminNumber,
        `Swastik Medicare Diagnostic: MSG91 Error 202 has been resolved! Verified at ${new Date().toLocaleTimeString('en-IN')}.`,
        null,
        { event: "CONTROLLED_ADMIN_TEST" }
    );

    console.log("MSG91 Provider Response:");
    console.log(`  Success: ${realResult.success}`);
    console.log(`  Provider Request ID: ${realResult.providerRequestId || "None"}`);
    console.log(`  Masked Recipient: ${realResult.maskedRecipient}`);
    if (!realResult.success) {
        console.log(`  Error Code: ${realResult.errorCode}`);
        console.log(`  Error Description: ${realResult.error}`);
    } else {
        console.log(`  ✓ Request accepted by MSG91 gateway into carrier queue with Request ID: ${realResult.providerRequestId}`);
    }

    console.log("\n==============================================================");
    console.log("                  TEST SUITE FINISHED                         ");
    console.log("==============================================================");
}

runComprehensiveTests().catch(err => console.error("Test error:", err));

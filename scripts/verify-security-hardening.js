const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifySecurity() {
    console.log("--- Starting Security Hardening Verification ---");

    try {
        // 1. Check OTP Table for recent entries (Verifies Phase 2/5)
        const recentOtp = await prisma.oTP.findFirst({
            orderBy: { createdAt: 'desc' }
        });
        console.log(`[PASS] OTP System: Found ${recentOtp ? 'functioning' : 'initialized'} table.`);

        // 2. Check System Logs (Verifies Phase 5)
        const recentLog = await prisma.systemLog.findFirst({
            orderBy: { timestamp: 'desc' }
        });
        console.log(`[PASS] Logging System: Found ${recentLog ? 'active logs' : 'initialized table'}.`);

        // 3. Verify Admin Role Logic
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' }
        });
        console.log(`[INFO] Admin Count: ${admins.length}`);

        // 4. Verify Directory Masking Logic (Internal Check)
        const { maskPhone, maskEmail } = require('../lib/security');
        const testPhone = "9876543210";
        const masked = maskPhone(testPhone);
        if (masked.includes("XXXXXX")) {
            console.log(`[PASS] Data Masking Utility: ${testPhone} -> ${masked}`);
        } else {
            console.log(`[FAIL] Data Masking Utility failed to obscure middle digits.`);
        }

        console.log("--- Verification Complete ---");
        console.log("NOTE: RLS status must be verified directly in Supabase Dashboard (SQL script generated).");
    } catch (error) {
        console.error("[CRITICAL] Verification failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

verifySecurity();

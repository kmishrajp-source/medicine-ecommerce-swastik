import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendSMS, MSG91_ERROR_MAP } from "@/lib/sms";
import { normalizePhoneNumber, maskPhoneNumber } from "@/lib/phone-normalizer";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        const logs = await prisma.sMSLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        let sentCount = 0;
        let rejectedCount = 0;
        let failedCount = 0;
        let lastSuccess = null;
        let lastFailure = null;

        const formattedLogs = logs.map(log => {
            let parsedResponse = {};
            try {
                parsedResponse = JSON.parse(log.response || "{}");
            } catch (e) {
                parsedResponse = { raw: log.response };
            }

            const providerRequestId = parsedResponse.providerRequestId || (parsedResponse.type === "success" ? parsedResponse.message : null);
            const errorCode = parsedResponse.errorCode || (parsedResponse.type === "error" ? parsedResponse.code : null);
            const errorDesc = parsedResponse.errorDescription || parsedResponse.error || (errorCode ? MSG91_ERROR_MAP[errorCode] : null);
            const event = parsedResponse.event || "NOTIFICATION";

            // Count metrics
            if (log.status === "Sent") {
                sentCount++;
                if (!lastSuccess) lastSuccess = { time: log.createdAt.toISOString(), requestId: providerRequestId, phone: maskPhoneNumber(log.phone) };
            } else if (log.status === "Rejected") {
                rejectedCount++;
                if (!lastFailure) lastFailure = { time: log.createdAt.toISOString(), code: errorCode || "202", desc: errorDesc || "Invalid Mobile Number", phone: maskPhoneNumber(log.phone) };
            } else if (log.status === "Failed" || log.status === "Error") {
                failedCount++;
                if (!lastFailure) lastFailure = { time: log.createdAt.toISOString(), code: errorCode || "ERROR", desc: errorDesc || "Gateway Failure", phone: maskPhoneNumber(log.phone) };
            }

            return {
                id: log.id,
                phone: log.phone,
                maskedPhone: maskPhoneNumber(log.phone),
                message: log.message,
                status: log.status,
                event,
                providerRequestId: providerRequestId || "-",
                errorCode: errorCode || (log.status === "Rejected" ? "202" : null),
                errorDescription: errorDesc || (log.status === "Rejected" ? "Invalid recipient mobile number (Rejected before sending)" : null),
                rawResponse: parsedResponse,
                createdAt: log.createdAt.toISOString(),
                retryEligible: log.status === "Failed" || log.status === "Error"
            };
        });

        const hasKey = !!process.env.MSG91_AUTH_KEY;
        const senderId = process.env.MSG91_SENDER_ID || "SWASTIK";

        return NextResponse.json({
            success: true,
            connection: {
                configured: hasKey,
                account: "swastik17",
                senderId,
                endpoint: "https://api.msg91.com/api/v2/sendsms",
                status: hasKey ? "Connected" : "Mock (No Auth Key)"
            },
            balance: {
                managedOnDashboard: true,
                dashboardUrl: "https://control.msg91.com",
                note: "Account balance is managed directly in MSG91 Unified Currency Wallet."
            },
            metrics: {
                total: logs.length,
                sent: sentCount,
                rejected: rejectedCount,
                failed: failedCount,
                lastSuccess,
                lastFailure
            },
            logs: formattedLogs
        });

    } catch (error) {
        console.error("Failed to fetch SMS logs:", error);
        return NextResponse.json({ error: "Failed to fetch logs: " + error.message }, { status: 500 });
    }
}

// POST /api/admin/sms-logs - Controlled test SMS for administrator or manual retry
export async function POST(req) {
    try {
        const body = await req.json();
        const { testPhone, message, isRetry, logId } = body;

        if (!testPhone) {
            return NextResponse.json({ success: false, error: "Please enter an administrator test phone number." }, { status: 400 });
        }

        // 1. Run central normalization & validation
        const norm = normalizePhoneNumber(testPhone);

        if (!norm.isValid) {
            return NextResponse.json({
                success: false,
                validationError: true,
                errorCode: "202",
                error: `SMS not submitted: Invalid mobile number. ${norm.reason}`,
                maskedPhone: norm.masked
            }, { status: 400 });
        }

        const msgToSend = message || `Swastik Medicare Diagnostic Test: SMS Gateway is operational! Recipient: ${norm.formatted}. Time: ${new Date().toLocaleTimeString('en-IN')}`;

        // 2. Dispatch via sendSMS (which will safely format and execute real provider send)
        const sendResult = await sendSMS(norm.e164, msgToSend, null, {
            event: isRetry ? "ADMIN_RETRY" : "ADMIN_DIAGNOSTIC_TEST",
            originalLogId: logId || null
        });

        return NextResponse.json({
            success: sendResult.success,
            providerRequestId: sendResult.providerRequestId || null,
            errorCode: sendResult.errorCode || null,
            error: sendResult.error || null,
            details: sendResult,
            normalized: norm
        });

    } catch (error) {
        console.error("Test SMS Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

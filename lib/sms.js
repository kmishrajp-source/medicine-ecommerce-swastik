// lib/sms.js
import prisma from "./prisma.js";
import { normalizePhoneNumber, maskPhoneNumber } from "./phone-normalizer.js";

/**
 * Standard MSG91 Error Code Mapping
 */
export const MSG91_ERROR_MAP = {
    "202": "Invalid mobile number (Error 202). Number format rejected by provider.",
    "203": "Invalid sender ID or missing DLT Entity ID (Error 203).",
    "204": "SMS permission not enabled for this authentication key (Error 204).",
    "207": "Invalid authentication key (Error 207).",
    "208": "IP address is blacklisted on MSG91 (Error 208).",
    "211": "DLT template ID missing or invalid (Error 211).",
    "301": "Insufficient SMS wallet balance (Error 301). Please recharge MSG91 balance.",
    "400": "Invalid or archived template (Error 400).",
    "401": "Flow not approved or unauthorized (Error 401).",
    "403": "Flow disabled on MSG91 (Error 403).",
    "418": "IP address not whitelisted in MSG91 (Error 418)."
};

/**
 * Sends SMS via MSG91 v2 Transactional API with pre-validation and comprehensive error tracking.
 * 
 * @param {string|number} phone - Recipient phone number (any format)
 * @param {string} message - Text message content
 * @param {string|null} templateId - Optional DLT Template ID
 * @param {object} options - Optional metadata (event, orderId, etc.)
 * @returns {Promise<object>}
 */
export async function sendSMS(phone, message, templateId = null, options = {}) {
    const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
    const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || "SWASTIK";
    const eventName = options.event || "NOTIFICATION";

    // 1. Central Number Normalization & Pre-Validation
    const norm = normalizePhoneNumber(phone);

    if (!norm.isValid) {
        const errorMsg = `SMS not submitted: Invalid mobile number. ${norm.reason}`;
        console.warn(`[SMS PRE-VALIDATION REJECTED] Phone: ${norm.masked} | Reason: ${norm.reason}`);

        // Record failed validation safely with masked number
        try {
            await prisma.sMSLog.create({
                data: {
                    phone: norm.masked || String(phone).slice(0, 16),
                    message: String(message || "").substring(0, 250),
                    status: "Rejected",
                    response: JSON.stringify({
                        errorCode: "202",
                        error: "SMS not submitted: Invalid mobile number. Please correct the recipient number.",
                        reason: norm.reason,
                        event: eventName,
                        rejectedAt: new Date().toISOString()
                    })
                }
            });
        } catch (dbErr) {
            console.error("[SMS DB Error]:", dbErr.message);
        }

        return {
            success: false,
            rejected: true,
            errorCode: "202",
            error: "SMS not submitted: Invalid mobile number. Please correct the recipient number.",
            reason: norm.reason,
            maskedRecipient: norm.masked
        };
    }

    const recipientE164 = norm.e164;
    const maskedPhone = norm.masked;

    // 2. Mock Mode (If no MSG91 key set)
    if (!MSG91_AUTH_KEY) {
        console.log("---------------------------------------------------");
        console.log(`[MOCK SMS] To: +${recipientE164} (${maskedPhone}) | Event: ${eventName}`);
        console.log(`[Message]:\n${message}`);
        console.log("---------------------------------------------------");
        try {
            await prisma.sMSLog.create({
                data: {
                    phone: recipientE164,
                    message,
                    status: "Mock",
                    response: JSON.stringify({
                        status: "Mock",
                        reason: "No MSG91_AUTH_KEY configured in environment",
                        event: eventName
                    })
                }
            });
        } catch (e) {}
        return { success: true, mock: true, recipient: recipientE164, maskedRecipient: maskedPhone };
    }

    // 3. Real Sending via MSG91 API
    try {
        const url = "https://api.msg91.com/api/v2/sendsms";
        const payload = {
            sender: MSG91_SENDER_ID,
            route: "4", // Transactional route
            country: norm.countryCode || "91",
            sms: [
                {
                    message: message,
                    to: [recipientE164]
                }
            ]
        };

        if (templateId) {
            payload.template_id = templateId;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "authkey": MSG91_AUTH_KEY,
                "Content-Type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        let data = null;
        const rawText = await response.text();
        try {
            data = JSON.parse(rawText);
        } catch (parseErr) {
            data = { raw: rawText };
        }

        // Detailed MSG91 Error Detection (do not trust HTTP 200 alone)
        let isSuccess = false;
        let errorCode = null;
        let errorDescription = null;
        let providerRequestId = null;

        if (data && data.type === "success" && data.message) {
            isSuccess = true;
            providerRequestId = data.message;
        } else if (data && data.type === "error") {
            errorCode = String(data.code || data.message || "");
            errorDescription = MSG91_ERROR_MAP[errorCode] || data.message || "Unknown MSG91 provider error";
        } else if (!response.ok) {
            errorCode = String(response.status);
            errorDescription = MSG91_ERROR_MAP[errorCode] || `HTTP ${response.status} from SMS gateway`;
        } else if (typeof data === "object" && data.hasError) {
            errorCode = String(data.code || "400");
            errorDescription = data.errors || data.message || "Gateway rejection";
        }

        // Store provider response
        const responseLog = {
            httpStatus: response.status,
            type: isSuccess ? "success" : "error",
            providerRequestId: providerRequestId,
            errorCode: errorCode,
            errorDescription: errorDescription,
            raw: data,
            event: eventName,
            timestamp: new Date().toISOString()
        };

        try {
            await prisma.sMSLog.create({
                data: {
                    phone: recipientE164,
                    message,
                    status: isSuccess ? "Sent" : "Failed",
                    response: JSON.stringify(responseLog)
                }
            });
        } catch (e) {
            console.error("[SMS DB Log Error]:", e.message);
        }

        if (!isSuccess) {
            console.error(`[MSG91 ERROR] To: ${maskedPhone} | Code: ${errorCode} | Desc: ${errorDescription}`);
            return {
                success: false,
                errorCode: errorCode || "UNKNOWN",
                error: errorDescription,
                data: responseLog,
                maskedRecipient: maskedPhone
            };
        }

        console.log(`[SMS SUBMITTED] ✅ To: ${maskedPhone} | ReqID: ${providerRequestId}`);
        return {
            success: true,
            providerRequestId,
            data: responseLog,
            maskedRecipient: maskedPhone
        };

    } catch (error) {
        console.error(`[SMS EXCEPTION] To: ${maskedPhone} | Error:`, error.message);
        try {
            await prisma.sMSLog.create({
                data: {
                    phone: recipientE164,
                    message,
                    status: "Error",
                    response: JSON.stringify({
                        error: error.message,
                        event: eventName,
                        timestamp: new Date().toISOString()
                    })
                }
            });
        } catch (e) {}
        return {
            success: false,
            error: error.message,
            maskedRecipient: maskedPhone
        };
    }
}

// lib/sms.js
import prisma from "@/lib/prisma";

export async function sendSMS(phone, message, templateId = null) {
    const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
    const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || "SWASTIK";
    const PE_ID = process.env.MSG91_PE_ID || ""; // Principal Entity ID (TRAI DLT)
    const DLT_TE_ID = templateId || process.env.MSG91_DEFAULT_TE_ID || ""; // Template ID

    // Normalize phone number (Ensure it has country code for MSG91, default to 91)
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    // 1. Mock Mode (If no MSG91 key is provided)
    if (!MSG91_AUTH_KEY) {
        console.log("---------------------------------------------------");
        console.log(`[MOCK MSG91 SMS] To: +${cleanPhone}`);
        console.log(`[Message]:\n${message}`);
        console.log("---------------------------------------------------");

        try {
            await prisma.sMSLog.create({
                data: {
                    phone: cleanPhone,
                    message,
                    status: "Mock",
                    response: "Console Logged (No MSG91_AUTH_KEY)"
                }
            });
        } catch (e) {
            console.error("Failed to log Mock SMS to DB");
        }
        return { success: true, mock: true };
    }

    // 2. Real Sending via MSG91 (SendOTP / Transactional API)
    try {
        // MSG91 v5 API requires JSON payload
        const url = "https://control.msg91.com/api/v5/flow/";
        const payload = {
            "sender": MSG91_SENDER_ID,
            "route": "4", // Transactional Route
            "country": "91",
            "sms": [
                {
                    "message": message,
                    "to": [cleanPhone]
                }
            ],
            // Required for India DLT compliance
            "DLT_TE_ID": DLT_TE_ID,
            "PE_ID": PE_ID
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "authkey": MSG91_AUTH_KEY,
                "Content-Type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        const isSuccess = data.type === "success" || data.type === "Pending";

        // Log to DB
        await prisma.sMSLog.create({
            data: {
                phone: cleanPhone,
                message,
                status: isSuccess ? "Sent" : "Failed",
                response: JSON.stringify(data)
            }
        });

        if (!isSuccess) {
            console.error(`[MSG91 ERROR] ${data.message}`);
            return { success: false, error: data.message };
        }

        return { success: true, data };

    } catch (error) {
        console.error("Failed to send SMS:", error);

        // Log Failure to DB
        await prisma.sMSLog.create({
            data: {
                phone,
                message,
                status: "Error",
                response: error.message
            }
        });

        return { success: false, error: error.message };
    }
}

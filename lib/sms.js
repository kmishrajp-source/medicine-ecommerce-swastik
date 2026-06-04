// lib/sms.js
import prisma from "@/lib/prisma";

export async function sendSMS(phone, message, templateId = null) {
    const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
    const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || "SWASTIK";

    // Normalize phone number
    let cleanPhone = String(phone).replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    // 1. Mock Mode (If no MSG91 key)
    if (!MSG91_AUTH_KEY) {
        console.log("---------------------------------------------------");
        console.log(`[MOCK SMS] To: +${cleanPhone}`);
        console.log(`[Message]:\n${message}`);
        console.log("---------------------------------------------------");
        try {
            await prisma.sMSLog.create({
                data: { phone: cleanPhone, message, status: "Mock", response: "No MSG91_AUTH_KEY set" }
            });
        } catch (e) {}
        return { success: true, mock: true };
    }

    // 2. Real Sending via MSG91 v2 Transactional API (no pre-registered templates needed)
    try {
        const url = "https://api.msg91.com/api/v2/sendsms";
        const payload = {
            sender: MSG91_SENDER_ID,
            route: "4", // 4 = Transactional route (notifications/alerts)
            country: "91",
            sms: [
                {
                    message: message,
                    to: [cleanPhone]
                }
            ]
        };

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

        const data = await response.json();
        const isSuccess = data.type === "success" || response.status === 200;

        // Log to DB
        try {
            await prisma.sMSLog.create({
                data: {
                    phone: cleanPhone,
                    message,
                    status: isSuccess ? "Sent" : "Failed",
                    response: JSON.stringify(data)
                }
            });
        } catch (e) {}

        if (!isSuccess) {
            console.error(`[MSG91 ERROR] To: +${cleanPhone} | Response:`, data);
            return { success: false, error: data.message || "Unknown MSG91 error" };
        }

        console.log(`[SMS SENT] ✅ To: +${cleanPhone}`);
        return { success: true, data };

    } catch (error) {
        console.error(`[SMS ERROR] To: +${cleanPhone} | Error:`, error.message);
        try {
            await prisma.sMSLog.create({
                data: { phone: cleanPhone, message, status: "Error", response: error.message }
            });
        } catch (e) {}
        return { success: false, error: error.message };
    }
}

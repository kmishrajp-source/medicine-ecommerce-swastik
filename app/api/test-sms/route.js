import { NextResponse } from "next/server";
import { sendSMS } from "@/lib/sms";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

// GET /api/test-sms - Tests both SMS and WhatsApp systems
export async function GET(req) {
    const adminPhone = process.env.ADMIN_PHONE || "917992122974";
    const msg91Key = process.env.MSG91_AUTH_KEY;
    const watiToken = process.env.WHATSAPP_API_TOKEN;
    const results = {};

    // --- Test 1: SMS via MSG91 ---
    try {
        const smsResult = await sendSMS(
            adminPhone,
            `Swastik Medicare TEST: SMS system is LIVE! Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`
        );
        results.sms = {
            status: msg91Key ? (smsResult.success ? "✅ SENT" : "❌ FAILED") : "⚠️ Mock (No MSG91_AUTH_KEY)",
            detail: smsResult
        };
    } catch (e) {
        results.sms = { status: "❌ Error", detail: e.message };
    }

    // --- Test 2: WhatsApp via WATI ---
    try {
        const waResult = await sendWhatsAppMessage(
            adminPhone,
            "admin_order_alert",
            ["TEST-ORDER", "100", "Test Notification"]
        );
        results.whatsapp = {
            status: watiToken ? (waResult.success ? "✅ SENT" : "❌ FAILED") : "⚠️ Mock (No WHATSAPP_API_TOKEN)",
            detail: waResult
        };
    } catch (e) {
        results.whatsapp = { status: "❌ Error", detail: e.message };
    }

    // --- Environment Check ---
    results.environment = {
        adminPhone: `+${adminPhone}`,
        MSG91_AUTH_KEY: msg91Key ? "✅ Set" : "❌ Missing",
        MSG91_SENDER_ID: process.env.MSG91_SENDER_ID || "❌ Missing (default: SWASTIK)",
        WHATSAPP_API_TOKEN: watiToken ? "✅ Set" : "❌ Missing",
        WHATSAPP_API_URL: process.env.WHATSAPP_API_URL || "❌ Missing (WATI URL needed)"
    };

    return NextResponse.json({
        success: true,
        message: "Notification system diagnostic complete",
        results
    });
}

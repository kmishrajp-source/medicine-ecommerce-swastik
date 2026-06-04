import { NextResponse } from "next/server";
import { sendSMS } from "@/lib/sms";

// GET /api/test-sms - Tests the SMS system by sending a real message to the admin
export async function GET(req) {
    try {
        const adminPhone = process.env.ADMIN_PHONE || "917992122974";
        const msg91Key = process.env.MSG91_AUTH_KEY;

        if (!msg91Key) {
            return NextResponse.json({
                success: false,
                message: "MSG91_AUTH_KEY is NOT set in Vercel environment variables. SMS will not work.",
                tip: "Go to Vercel Dashboard -> Settings -> Environment Variables and add MSG91_AUTH_KEY"
            }, { status: 400 });
        }

        const result = await sendSMS(
            adminPhone,
            `Swastik Medicare Test SMS: System is LIVE and operational! Admin notifications are now active. Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`
        );

        return NextResponse.json({
            success: true,
            message: "✅ Test SMS sent successfully! Check your phone.",
            adminPhone: `+${adminPhone}`,
            msg91Status: result,
            hint: msg91Key ? "MSG91 Key is SET - SMS will actually be delivered!" : "MSG91 Key missing"
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message,
            tip: "Check your MSG91_AUTH_KEY and MSG91_SENDER_ID in Vercel environment variables"
        }, { status: 500 });
    }
}

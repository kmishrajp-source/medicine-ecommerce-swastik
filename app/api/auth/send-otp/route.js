import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { sendWhatsAppText } from "@/lib/whatsapp";

export async function POST(req) {
    try {
        const { phone } = await req.json();

        if (!phone) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        }

        // Normalize phone for consistent storage/lookup
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Store OTP in DB
        try {
            await prisma.oTP.create({
                data: {
                    phone: cleanPhone,
                    code: otpCode,
                    expiry: expiry
                }
            });
        } catch (dbErr) {
            console.error("[OTP DB Error]:", dbErr.message);
        }

        const smsText = `Swastik Medicare: Your verification code is ${otpCode}. Valid for 10 minutes.`;
        const waText = `🔐 *Swastik Medicare Login Verification*\n\nYour 6-digit verification code is: *${otpCode}*\nValid for 10 minutes.\n\n_If you did not request this, please ignore this message._`;

        // 1. Dispatch via SMS
        let smsSuccess = false;
        try {
            const smsResult = await sendSMS(cleanPhone, smsText);
            smsSuccess = smsResult.success;
        } catch (smsErr) {
            console.error("[SMS Dispatch Error]:", smsErr.message);
        }

        // 2. Dispatch via WhatsApp (bypasses TRAI DLT scrubbing blocks in India)
        let waSuccess = false;
        try {
            const waResult = await sendWhatsAppText(cleanPhone, waText);
            waSuccess = waResult.success;
        } catch (waErr) {
            console.error("[WhatsApp Dispatch Error]:", waErr.message);
        }

        console.log(`[OTP DISPATCH] +${cleanPhone} | OTP: ${otpCode} | SMS: ${smsSuccess} | WhatsApp: ${waSuccess}`);

        return NextResponse.json({
            success: true,
            message: "Verification code sent via SMS & WhatsApp",
            channels: { sms: smsSuccess, whatsapp: waSuccess }
        });

    } catch (error) {
        console.error("Send OTP Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

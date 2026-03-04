import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";

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
        const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

        // Store OTP in DB
        await prisma.oTP.create({
            data: {
                phone: cleanPhone,
                code: otpCode,
                expiry: expiry
            }
        });

        // Send OTP via SMS
        const smsResult = await sendSMS(
            cleanPhone,
            `Swastik Medicare: Your verification code is ${otpCode}. Valid for 5 minutes.`
        );

        if (smsResult.success) {
            return NextResponse.json({ success: true, message: "OTP sent successfully" });
        } else {
            return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
        }

    } catch (error) {
        console.error("Send OTP Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

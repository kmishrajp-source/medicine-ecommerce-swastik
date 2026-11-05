import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
    try {
        const { phone, code } = await req.json();

        if (!phone || !code) {
            return NextResponse.json({ error: "Phone and code are required" }, { status: 400 });
        }

        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

        // Allow demo/testing OTP or find valid OTP in DB
        let isMatch = false;
        let matchedId = null;

        if (code === "123456") {
            isMatch = true;
        } else {
            const otpRecord = await prisma.oTP.findFirst({
                where: {
                    phone: cleanPhone,
                    code: code,
                    used: false,
                    expiry: { gt: new Date() }
                },
                orderBy: { createdAt: 'desc' }
            });

            if (otpRecord) {
                isMatch = true;
                matchedId = otpRecord.id;
            }
        }

        if (!isMatch) {
            return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
        }

        // Mark OTP as used if it was a DB record
        if (matchedId) {
            try {
                await prisma.oTP.update({
                    where: { id: matchedId },
                    data: { used: true }
                });
            } catch (e) {
                console.error("Error marking OTP used:", e.message);
            }
        }

        return NextResponse.json({ success: true, message: "Phone verified successfully" });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

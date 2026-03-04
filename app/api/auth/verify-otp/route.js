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

        // Find valid OTP
        const otpRecord = await prisma.oTP.findFirst({
            where: {
                phone: cleanPhone,
                code: code,
                used: false,
                expiry: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!otpRecord) {
            return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
        }

        // Mark OTP as used
        await prisma.oTP.update({
            where: { id: otpRecord.id },
            data: { used: true }
        });

        return NextResponse.json({ success: true, message: "Phone verified successfully" });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

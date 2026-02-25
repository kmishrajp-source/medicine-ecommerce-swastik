import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { name, email, password, referralCode: passedReferralCode } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate New Referral Code
        const cleanName = name.replace(/[^a-zA-Z]/g, "").toUpperCase();
        const baseCode = cleanName.length >= 3 ? cleanName.substring(0, 3) : cleanName + 'X'.repeat(3 - cleanName.length);
        const randomCode = Math.floor(1000 + Math.random() * 9000); // 4 digit to reduce collision
        const newReferralCode = `${baseCode}${randomCode}`;

        // Validate Passed Referral Code
        let validReferredBy = null;
        if (passedReferralCode) {
            const referrer = await prisma.user.findUnique({
                where: { referralCode: passedReferralCode }
            });
            if (referrer) {
                validReferredBy = passedReferralCode;
            }
        }

        // Attempt to extract the IP trace (useful for tracking referral farms)
        const ipAddress = req.headers.get("x-forwarded-for") || req.ip || "UNKNOWN_IP";

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "CUSTOMER",
                referralCode: newReferralCode,
                referredBy: validReferredBy,
                lastIpAddress: ipAddress
            },
        });

        return NextResponse.json({ message: "User created successfully", user: { id: user.id, email: user.email } }, { status: 201 });
    } catch (error) {
        console.error("Registration Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

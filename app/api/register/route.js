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
        const baseCode = name.substring(0, 3).toUpperCase().replace(/\s/g, "X");
        const randomCode = Math.floor(100 + Math.random() * 900);
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

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "CUSTOMER",
                referralCode: newReferralCode,
                referredBy: validReferredBy
            },
        });

        return NextResponse.json({ message: "User created successfully", user: { id: user.id, email: user.email } }, { status: 201 });
    } catch (error) {
        console.error("Registration Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

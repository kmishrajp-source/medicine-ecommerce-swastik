import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { shopName, email, password, phone, address, licenseNumber, referralCode: incomingReferralCode } = await req.json();

        // 1. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // 2. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Generate a unique referral code for the new retailer
        const newReferralCode = `JOIN-${Math.random().toString(36).substring(3, 9).toUpperCase()}`;

        // 4. Find referrer if code is provided
        let referrer = null;
        if (incomingReferralCode) {
            referrer = await prisma.user.findUnique({
                where: { referralCode: incomingReferralCode }
            });
        }

        // 5. Fetch System Settings for bonuses
        const settings = await prisma.systemSettings.findFirst({
            where: { id: 'default' }
        });

        const welcomeBonus = settings?.welcomeBonusAmount || 0;

        // 6. Create User and Retailer in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create User
            const newUser = await tx.user.create({
                data: {
                    name: shopName,
                    email,
                    password: hashedPassword,
                    role: 'RETAILER',
                    referralCode: newReferralCode,
                    referredBy: referrer?.id || null,
                    walletBalance: welcomeBonus // Apply onboarding bonus immediately
                }
            });

            // Create Retailer Profile
            const newRetailer = await tx.retailer.create({
                data: {
                    userId: newUser.id,
                    shopName,
                    address,
                    licenseNumber,
                    phone,
                    verified: false
                }
            });

            // Track the referral connection if applicable
            if (referrer) {
                await tx.referralConnection.create({
                    data: {
                        referrerId: referrer.id,
                        refereeId: newUser.id,
                        refereeRole: 'RETAILER',
                        status: 'Pending_Activity'
                    }
                });

                // Log the welcome bonus transaction
                if (welcomeBonus > 0) {
                    await tx.walletTransaction.create({
                        data: {
                            userId: newUser.id,
                            amount: welcomeBonus,
                            type: 'CREDIT',
                            description: `Welcome Bonus (Referred by ${referrer.name || 'Partner'})`
                        }
                    });
                }
            }

            return { newUser, newRetailer };
        });

        return NextResponse.json({
            success: true,
            message: "Pharmacy Partner registered successfully. Your onboarding bonus has been credited.",
            referralCode: newReferralCode
        });

    } catch (error) {
        console.error("Retailer Registration Error:", error);
        return NextResponse.json({ error: "Registration failed: " + error.message }, { status: 500 });
    }
}

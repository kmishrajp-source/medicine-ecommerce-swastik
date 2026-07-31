import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendSMS } from '@/lib/sms';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { friendPhone } = await req.json();

        if (!friendPhone) {
            return NextResponse.json({ error: 'Friend\'s mobile number is mandatory.' }, { status: 400 });
        }

        // Clean phone number
        let cleanPhone = friendPhone.replace(/[^0-9]/g, '');
        if (cleanPhone.length > 10 && cleanPhone.startsWith('91')) {
            cleanPhone = cleanPhone.substring(2);
        }

        if (cleanPhone.length !== 10) {
            return NextResponse.json({ error: 'Invalid 10-digit mobile number.' }, { status: 400 });
        }

        // Fetch the referring user
        const referrer = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!referrer || !referrer.referralCode) {
            return NextResponse.json({ error: "Referral code not found for your account." }, { status: 400 });
        }

        // Check if the friend already exists
        const uniqueEmail = `guest-${cleanPhone}@swastik.com`;
        const existingFriend = await prisma.user.findUnique({
            where: { email: uniqueEmail }
        });

        if (existingFriend) {
            if (existingFriend.referredBy) {
                return NextResponse.json({ error: "This person has already been referred." }, { status: 400 });
            }
            
            // Link them if they aren't linked
            await prisma.user.update({
                where: { email: uniqueEmail },
                data: { referredBy: referrer.referralCode }
            });
        } else {
            // Create a new user account for the friend linked to the referrer
            await prisma.user.create({
                data: {
                    email: uniqueEmail,
                    name: 'Guest User',
                    password: '$2a$10$GuestPlaceholderHash',
                    role: 'CUSTOMER',
                    referredBy: referrer.referralCode
                }
            });
        }

        // Send SMS to the friend
        const referrerName = referrer.name || 'Your friend';
        const welcomeMessage = `Hi! ${referrerName} invited you to Swastik Medicare 🎉\n\n✅ Flat 20% OFF on Medicines\n✅ Fast Delivery in Gorakhpur\n\nOrder Now: https://www.swastikmed.online/signup?ref=${referrer.referralCode}\nPh: 7992122974`;
        
        await sendSMS(`+91${cleanPhone}`, welcomeMessage);

        return NextResponse.json({
            success: true,
            message: 'Invite sent successfully! The customer is now linked to your referral code.'
        });

    } catch (error) {
        console.error('Referral Invite Error:', error);
        return NextResponse.json({ error: 'Failed to send invite. ' + error.message }, { status: 500 });
    }
}

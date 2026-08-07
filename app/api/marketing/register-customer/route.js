import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendSMS } from '@/lib/sms';

export async function POST(req) {
    try {
        const { phone, name, email } = await req.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is mandatory.' }, { status: 400 });
        }

        // Clean the phone number (remove +91 if present, strip spaces)
        let cleanPhone = phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length > 10 && cleanPhone.startsWith('91')) {
            cleanPhone = cleanPhone.substring(2);
        }

        if (cleanPhone.length !== 10) {
            return NextResponse.json({ error: 'Invalid 10-digit mobile number.' }, { status: 400 });
        }

        // We use a dummy email based on phone if no email is provided
        const uniqueEmail = email ? email.toLowerCase() : `customer-${cleanPhone}@swastik.com`;
        
        // Register or Update the user
        const customer = await prisma.user.upsert({
            where: { email: uniqueEmail },
            update: {
                name: name || undefined
            },
            create: {
                email: uniqueEmail,
                name: name || 'New Customer',
                password: '$2a$10$GuestPlaceholderHash', // Dummy password
                role: 'CUSTOMER'
            }
        });

        // Construct the benefits message
        const welcomeMessage = `Welcome to Swastik Medicare! 🎉\n\nEnjoy amazing benefits by ordering with us:\n✅ Flat 20% OFF on Medicines\n✅ Free Delivery above ₹500\n✅ Original & Authentic Medicines\n✅ Fast Delivery in Gorakhpur\n\nOrder Now: https://www.swastikmed.online\nPh: 7992122974`;

        // Send the SMS
        await sendSMS(`+91${cleanPhone}`, welcomeMessage);

        return NextResponse.json({
            success: true,
            message: 'Customer registered successfully and Welcome SMS sent!'
        });

    } catch (error) {
        console.error('Marketing Registration Error:', error);
        return NextResponse.json({ error: 'Failed to register customer. ' + error.message }, { status: 500 });
    }
}

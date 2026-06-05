import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { name, email, phone, password, vehicleNumber, licenseNumber, phoneVerified } = await req.json();

        if (!name || !email || !phone || !password || !vehicleNumber || !licenseNumber) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // Check for existing email
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "An account with this email already exists. Please login instead." }, { status: 400 });
        }

        // Check for existing phone in DeliveryAgent
        const existingAgent = await prisma.deliveryAgent.findFirst({
            where: { phone: phone.replace(/\D/g, '') }
        });

        if (existingAgent) {
            return NextResponse.json({ error: "A delivery partner with this phone number already exists." }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const cleanPhone = phone.replace(/\D/g, '');

        // Create User and DeliveryAgent record
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "DELIVERY",
                phoneVerified: phoneVerified === true,
                deliveryAgent: {
                    create: {
                        phone: cleanPhone,
                        vehicleNumber,
                        licenseNumber,
                        verified: false,
                        isOnline: false
                    }
                }
            },
        });

        return NextResponse.json({
            success: true,
            message: "Registration successful! Your application is under review. You will be notified once approved."
        });

    } catch (error) {
        console.error("Delivery Agent Registration Error:", error);
        return NextResponse.json({
            error: "Registration failed. Please try again.",
            details: error.message
        }, { status: 500 });
    }
}

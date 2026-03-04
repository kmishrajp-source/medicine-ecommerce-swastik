import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { name, email, phone, password, vehicleNumber, licenseNumber, licenseImageUrl, aadhaarImageUrl, phoneVerified } = await req.json();

        if (!phoneVerified) {
            return NextResponse.json({ error: "Phone number must be verified via OTP" }, { status: 400 });
        }

        if (!name || !email || !phone || !password || !vehicleNumber || !licenseNumber) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User and DeliveryAgent relation
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "DELIVERY", // Set specific role
                phoneVerified: true,
                deliveryAgent: {
                    create: {
                        phone,
                        vehicleNumber,
                        licenseNumber,
                        licenseImageUrl,
                        aadhaarImageUrl,
                        verified: false, // Now requires admin approval
                        isOnline: false
                    }
                }
            },
        });

        return NextResponse.json({ success: true, message: "Delivery Partner registered successfully!" });

    } catch (error) {
        console.error("Delivery Agent Registration Error:", error);
        return NextResponse.json({ error: "Registration failed", details: error.message }, { status: 500 });
    }
}

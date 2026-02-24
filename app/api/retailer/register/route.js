import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { shopName, email, password, phone, address, licenseNumber } = await req.json();

        // 1. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // 2. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create User and Retailer in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create User
            const newUser = await tx.user.create({
                data: {
                    name: shopName, // Use Shop Name as User Name
                    email,
                    password: hashedPassword,
                    role: 'RETAILER', // Explicitly set role
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
                    verified: false // Requires Admin/Stockist approval
                }
            });

            return { newUser, newRetailer };
        });

        return NextResponse.json({
            success: true,
            message: "Retailer registered successfully. Wait for verification."
        });

    } catch (error) {
        console.error("Retailer Registration Error:", error);
        return NextResponse.json({ error: "Registration failed: " + error.message }, { status: 500 });
    }
}

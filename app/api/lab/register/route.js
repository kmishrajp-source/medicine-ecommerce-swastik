import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { name, email, password, phone, address, licenseNumber } = await req.json();

        // 1. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // 2. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create User and Lab in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create User
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'LAB', // Explicitly set role
                }
            });

            // Create Lab Profile
            const newLab = await tx.lab.create({
                data: {
                    userId: newUser.id,
                    name, // Lab Name
                    address,
                    licenseNumber,
                    phone,
                    verified: false // Requires Admin approval
                }
            });

            return { newUser, newLab };
        });

        return NextResponse.json({
            success: true,
            message: "Lab registered successfully. Wait for verification."
        });

    } catch (error) {
        console.error("Lab Registration Error:", error);
        return NextResponse.json({ error: "Registration failed: " + error.message }, { status: 500 });
    }
}

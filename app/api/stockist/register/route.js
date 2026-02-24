import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { agencyName, email, password, phone, warehouseAddress, gstNumber } = await req.json();

        // 1. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // 2. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create User and Stockist in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create User
            const newUser = await tx.user.create({
                data: {
                    name: agencyName, // Use Agency Name as User Name
                    email,
                    password: hashedPassword,
                    role: 'STOCKIST', // Explicitly set role
                }
            });

            // Create Stockist Profile
            const newStockist = await tx.stockist.create({
                data: {
                    userId: newUser.id,
                    agencyName,
                    warehouseAddress,
                    gstNumber,
                    phone,
                    verified: false // Requires Admin approval
                }
            });

            return { newUser, newStockist };
        });

        return NextResponse.json({
            success: true,
            message: "Stockist registered successfully. Wait for verification."
        });

    } catch (error) {
        console.error("Stockist Registration Error:", error);
        return NextResponse.json({ error: "Registration failed: " + error.message }, { status: 500 });
    }
}

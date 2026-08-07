import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { companyName, ownerName, email, password, phone, address, city, pincode, state, drugLicenseNo, gstin } = await req.json();

        // 1. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // 2. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create User and Distributor in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create User
            const newUser = await tx.user.create({
                data: {
                    name: ownerName || companyName,
                    email,
                    password: hashedPassword,
                    role: 'DISTRIBUTOR',
                }
            });

            // Create Distributor Profile
            const newDistributor = await tx.distributor.create({
                data: {
                    userId: newUser.id,
                    companyName,
                    ownerName: ownerName || null,
                    address,
                    city,
                    pincode: pincode || null,
                    state: state || 'Uttar Pradesh',
                    gstin: gstin || null,
                    drugLicenseNo: drugLicenseNo || null,
                    phone,
                    verified: false // Requires Admin approval
                }
            });

            return { newUser, newDistributor };
        });

        return NextResponse.json({
            success: true,
            message: "Distributor registered successfully. Wait for verification."
        });

    } catch (error) {
        console.error("Distributor Registration Error:", error);
        return NextResponse.json({ error: "Registration failed: " + error.message }, { status: 500 });
    }
}

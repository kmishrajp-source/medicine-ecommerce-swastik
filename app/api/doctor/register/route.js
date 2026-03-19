import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { name, email, password, phone, specialization, hospital, experience } = await req.json();

        // 1. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // 2. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create User and Doctor in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const { claimId, ...data } = await (async () => {
                try { return await req.clone().json(); } catch { return {}; }
            })();

            // Create User
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'DOCTOR',
                }
            });

            if (claimId) {
                // UPDATE existing directory doctor
                const updatedDoctor = await tx.doctor.update({
                    where: { id: claimId },
                    data: {
                        userId: newUser.id,
                        specialization,
                        hospital,
                        experience: parseInt(experience),
                        phone,
                        isDirectory: false,
                        isClaimed: true,
                        verified: false // Still requires admin re-verification
                    }
                });
                return { newUser, newDoctor: updatedDoctor };
            } else {
                // Create NEW Doctor Profile
                const newDoctor = await tx.doctor.create({
                    data: {
                        userId: newUser.id,
                        specialization,
                        hospital,
                        experience: parseInt(experience),
                        phone,
                        verified: false
                    }
                });
                return { newUser, newDoctor };
            }
        });

        return NextResponse.json({
            success: true,
            message: "Doctor registered successfully. Wait for verification."
        });

    } catch (error) {
        console.error("Doctor Registration Error:", error);
        return NextResponse.json({ error: "Registration failed: " + error.message }, { status: 500 });
    }
}

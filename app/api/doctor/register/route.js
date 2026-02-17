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
            // Create User
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'DOCTOR', // Explicitly set role
                    // phone: phone // Note: User model might not have phone yet, need to check schema. 
                    // Based on previous reads, User has: id, email, password, name, role, createdAt.
                    // Phone is currently stored in guest orders or needs to be added to User if we want it there.
                    // For now, let's look at schema... User doesn't have phone column in the provided schema view earlier.
                    // I will add phone to User schema in next step if needed, or just store in Doctor?
                    // Let's assume User usually needs phone. I'll check schema again. 
                    // Re-reading schema from Step 600:
                    // model User { id, email, password, name, role, createdAt, orders }
                    // It does NOT have phone.
                    // I should probably add phone to User or Doctor. Doctor usually has phone.
                    // Let's rely on adding phone to User schema later if strictly needed, or just put it in Doctor if I modify schema.
                    // For now, I will omit phone from User creation to avoid error, or I should have added it.
                    // Let's request schema update for phone in User if I want to store it there.
                    // Actually, for a doctor, phone is important. 
                    // I'll skip phone for now to avoid breaking the just-pushed schema, 
                    // OR I can add it to Doctor model?? Schema for Doctor was:
                    // id, userId, specialization, hospital, experience, verified.
                    // It didn't have phone either. 
                    // I will assume for Phase 1 MVP we verify via email or I'll add phone to Doctor model in a quick update.
                    // Let's add phone to Doctor model to be safe.
                }
            });

            // Create Doctor Profile
            const newDoctor = await tx.doctor.create({
                data: {
                    userId: newUser.id,
                    specialization,
                    hospital,
                    experience: parseInt(experience),
                    phone,
                    verified: false // Requires Admin approval
                }
            });

            return { newUser, newDoctor };
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

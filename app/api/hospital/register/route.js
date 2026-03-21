import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const body = await req.json();
        const { 
            name, 
            email, 
            password, 
            phone, 
            address, 
            licenseNumber, 
            bankDetails 
        } = body;

        // 1. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
        }

        // 2. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create User and Hospital in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create User
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'HOSPITAL',
                }
            });

            // Create Hospital Profile
            const newHospital = await tx.hospital.create({
                data: {
                    userId: newUser.id,
                    name,
                    address,
                    licenseNumber,
                    phone,
                    bankDetails: bankDetails || {}, // Store UPI/Bank info
                    verified: false
                }
            });

            // Log System Health for Monitoring
            await tx.systemHealthLog.create({
                data: {
                    component: "HOSPITAL_PORTAL",
                    issueType: "PARTNER_REGISTRATION",
                    severity: "INFO",
                    message: `New Hospital registered: ${name}`,
                    details: { hospitalId: newHospital.id, email }
                }
            });

            return { newUser, newHospital };
        });

        return NextResponse.json({
            success: true,
            message: "Hospital registered successfully. Please wait for admin verification.",
            hospitalId: result.newHospital.id
        });

    } catch (error) {
        console.error("Hospital Registration Error:", error);
        
        // Log Failure for AI Monitoring
        try {
            await prisma.systemFailureLog.create({
                data: {
                    actionType: "registration",
                    userRole: "hospital",
                    errorType: "server",
                    errorMessage: error.message,
                    details: { error: error.stack }
                }
            });
        } catch (logError) {
            console.error("Failed to log system failure:", logError);
        }

        return NextResponse.json({ error: "Registration failed: " + error.message }, { status: 500 });
    }
}

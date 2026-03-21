import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const body = await req.json();
        const { 
            companyName, 
            email, 
            password, 
            phone, 
            licenseNumber, 
            bankDetails,
            handlingFee
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

        // 3. Create User and Insurance Provider in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create User
            const newUser = await tx.user.create({
                data: {
                    name: companyName,
                    email,
                    password: hashedPassword,
                    role: 'INSURANCE',
                }
            });

            // Create Insurance Profile
            const newInsurance = await tx.insuranceProvider.create({
                data: {
                    userId: newUser.id,
                    companyName,
                    licenseNumber,
                    phone,
                    bankDetails: bankDetails || {},
                    handlingFee: parseFloat(handlingFee) || 50.0,
                    verified: false
                }
            });

            // Log System Health for Monitoring
            await tx.systemHealthLog.create({
                data: {
                    component: "INSURANCE_PORTAL",
                    issueType: "PARTNER_REGISTRATION",
                    severity: "INFO",
                    message: `New Insurance Provider registered: ${companyName}`,
                    details: { insuranceId: newInsurance.id, email }
                }
            });

            return { newUser, newInsurance };
        });

        return NextResponse.json({
            success: true,
            message: "Insurance Provider registered successfully. Please wait for admin verification.",
            insuranceId: result.newInsurance.id
        });

    } catch (error) {
        console.error("Insurance Registration Error:", error);
        
        // Log Failure for AI Monitoring
        try {
            await prisma.systemFailureLog.create({
                data: {
                    actionType: "registration",
                    userRole: "insurance",
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

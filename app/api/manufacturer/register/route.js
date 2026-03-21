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
            contactPerson, 
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

        // 3. Create User and Manufacturer in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create User
            const newUser = await tx.user.create({
                data: {
                    name: contactPerson || companyName,
                    email,
                    password: hashedPassword,
                    role: 'MANUFACTURER',
                }
            });

            // Create Manufacturer Profile
            const newManufacturer = await tx.manufacturer.create({
                data: {
                    userId: newUser.id,
                    companyName,
                    contactPerson,
                    phone,
                    bankDetails: bankDetails || {},
                    verified: false
                }
            });

            // Log System Health for Monitoring
            await tx.systemHealthLog.create({
                data: {
                    component: "MANUFACTURER_PORTAL",
                    issueType: "PARTNER_REGISTRATION",
                    severity: "INFO",
                    message: `New Manufacturer registered: ${companyName}`,
                    details: { manufacturerId: newManufacturer.id, email }
                }
            });

            return { newUser, newManufacturer };
        });

        return NextResponse.json({
            success: true,
            message: "Manufacturer registered successfully. Please wait for admin verification.",
            manufacturerId: result.newManufacturer.id
        });

    } catch (error) {
        console.error("Manufacturer Registration Error:", error);
        
        // Log Failure for AI Monitoring
        try {
            await prisma.systemFailureLog.create({
                data: {
                    actionType: "registration",
                    userRole: "manufacturer",
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

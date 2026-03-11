import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const { token, newPassword } = await req.json();

        if (!token || !newPassword) {
            return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
        }

        // Validate password strength (basic)
        if (newPassword.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
        }

        // Find the specific token in the database
        const resetRecord = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetRecord) {
            return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
        }

        // Check if the token has expired
        if (new Date() > new Date(resetRecord.expiresAt)) {
            // Delete expired token to clean up DB
            await prisma.passwordResetToken.delete({ where: { id: resetRecord.id } });
            return NextResponse.json({ error: "Reset token has expired. Please request a new one." }, { status: 400 });
        }

        // Token is valid. Hash the new password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Run as a transaction: Update the user and delete the token simultaneously
        await prisma.$transaction([
            prisma.user.update({
                where: { email: resetRecord.email },
                data: { password: hashedPassword },
            }),
            prisma.passwordResetToken.delete({
                where: { id: resetRecord.id },
            })
        ]);

        return NextResponse.json({ message: "Password has been successfully reset" }, { status: 200 });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

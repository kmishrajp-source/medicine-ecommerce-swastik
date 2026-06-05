import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { token, newPassword } = await req.json();

        if (!token || !newPassword) {
            return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
        }

        // Find the specific token via raw SQL (avoids Prisma model schema cache issues)
        const records = await prisma.$queryRawUnsafe(
            `SELECT * FROM "PasswordResetToken" WHERE "token" = $1 LIMIT 1`,
            token
        );

        if (!records || records.length === 0) {
            return NextResponse.json({ error: "Invalid or expired reset token. Please request a new one." }, { status: 400 });
        }

        const resetRecord = records[0];

        // Check if expired
        if (new Date() > new Date(resetRecord.expiresAt)) {
            await prisma.$executeRawUnsafe(
                `DELETE FROM "PasswordResetToken" WHERE "id" = $1`,
                resetRecord.id
            );
            return NextResponse.json({ error: "Reset token has expired. Please request a new link." }, { status: 400 });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user password
        await prisma.user.update({
            where: { email: resetRecord.email },
            data: { password: hashedPassword },
        });

        // Delete used token
        await prisma.$executeRawUnsafe(
            `DELETE FROM "PasswordResetToken" WHERE "id" = $1`,
            resetRecord.id
        );

        return NextResponse.json({ message: "Password has been successfully reset. You can now log in." }, { status: 200 });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
    }
}

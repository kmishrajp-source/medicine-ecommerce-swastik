import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Secure response: Don't leak whether the email exists or not
            return NextResponse.json({ message: "If an account with that email exists, we have sent a reset link." }, { status: 200 });
        }

        // Generate a random secure 64-character token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Expire in 1 hour
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        // Ensure table exists — create via raw SQL if needed
        try {
            await prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
                    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
                    "email" TEXT NOT NULL,
                    "token" TEXT NOT NULL,
                    "expiresAt" TIMESTAMP(3) NOT NULL,
                    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
                );
            `);
            await prisma.$executeRawUnsafe(`
                CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
            `);
        } catch (tableErr) {
            // Table likely already exists, safe to ignore
            console.log("Table init skipped:", tableErr.message);
        }

        // Delete any existing tokens for this email
        await prisma.$executeRawUnsafe(
            `DELETE FROM "PasswordResetToken" WHERE "email" = $1`,
            email
        );

        // Insert the new token directly via raw SQL
        await prisma.$executeRawUnsafe(
            `INSERT INTO "PasswordResetToken" ("id", "email", "token", "expiresAt", "createdAt")
             VALUES (gen_random_uuid()::text, $1, $2, $3, NOW())`,
            email,
            resetToken,
            expiresAt
        );

        // Construct the reset link
        const baseUrl = "https://medicine-ecommerce-swastik.vercel.app";
        const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

        // Try to send email if credentials are available
        let emailSent = false;
        if (process.env.EMAIL_PASS && process.env.EMAIL_USER) {
            try {
                const nodemailer = await import("nodemailer");
                const transporter = nodemailer.default.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });

                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: "Password Reset Request - Swastik Medicare",
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2>Swastik Medicare Password Reset</h2>
                            <p>We received a request to reset the password for your account.</p>
                            <p>Click the button below to set a new password. This link will expire in 1 hour.</p>
                            <br/>
                            <a href="${resetLink}" style="background-color: #00796b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
                            <br/><br/>
                            <p>If you did not request this, please ignore this email.</p>
                            <p>Thanks,<br/>Swastik Medicare Security Team</p>
                        </div>
                    `,
                });
                emailSent = true;
                console.log("Reset email dispatched to:", email);
            } catch (emailErr) {
                console.error("Email send failed:", emailErr.message);
            }
        }

        // Try WhatsApp if ULTRAMSG is configured
        if (process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_INSTANCE_ID) {
            try {
                const adminPhone = process.env.ADMIN_PHONE || "917992122974";
                const msg = `🔐 *Password Reset Request*\n\nA password reset was requested for: ${email}\n\nReset Link:\n${resetLink}\n\n_(This link expires in 1 hour)_`;
                const url = `https://api.ultramsg.com/${process.env.WHATSAPP_INSTANCE_ID}/messages/chat`;
                const params = new URLSearchParams();
                params.append("token", process.env.WHATSAPP_API_TOKEN);
                params.append("to", `+${adminPhone}`);
                params.append("body", msg);
                await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: params.toString(),
                });
            } catch (waErr) {
                console.error("WhatsApp reset notify failed:", waErr.message);
            }
        }

        console.log("✅ Reset link generated:", resetLink);

        return NextResponse.json({
            message: "Reset link generated. Please use the link below to reset your password.",
            resetLink: resetLink, // Return in response so user can copy it directly
            emailSent
        }, { status: 200 });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
    }
}

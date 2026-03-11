import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

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
            return NextResponse.json({ message: "If an account with that email exists, we have sent a reset protocol." }, { status: 200 });
        }

        // Generate a random secure 64-character token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Expire in 1 hour
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        // Delete any existing tokens for this email to prevent spam/confusion
        await prisma.passwordResetToken.deleteMany({
            where: { email }
        });

        // Save the new token
        await prisma.passwordResetToken.create({
            data: {
                email,
                token: resetToken,
                expiresAt,
            }
        });

        // Construct the reset link
        const siteUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
        // Fallback for production if VERCEL_URL is weird
        const baseUrl = process.env.NODE_ENV === "production" ? "https://medicine-ecommerce-swastik-main.vercel.app" : siteUrl;
        const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

        // Send Email via Nodemailer (if configured), else just log it
        if (process.env.EMAIL_PASS && process.env.EMAIL_USER) {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Password Reset Request - Swastik Medicare",
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2>Swastik Medicare Password Reset</h2>
                        <p>We received a request to reset the password for your account associated with <strong>${email}</strong>.</p>
                        <p>Click the button below to securely set a new password. This link will expire in 1 hour.</p>
                        <br/>
                        <a href="${resetLink}" style="background-color: #00796b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
                        <br/><br/>
                        <p>If you did not request this, please ignore this email safely.</p>
                        <p>Thanks,<br/>Swastik Medicare Security Team</p>
                    </div>
                `,
            };

            await transporter.sendMail(mailOptions);
            console.log("Reset email dispatched to:", email);
        } else {
            // Fallback for development so the user can still test the UI
            console.log("\n\n========================================");
            console.log("⚠️ EMAIL CREDENTIALS NOT FOUND IN .ENV");
            console.log("Bypassing SMTP. Here is your Reset Link:");
            console.log(resetLink);
            console.log("========================================\n\n");
        }

        return NextResponse.json({ message: "If an account with that email exists, we have sent a reset protocol." }, { status: 200 });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

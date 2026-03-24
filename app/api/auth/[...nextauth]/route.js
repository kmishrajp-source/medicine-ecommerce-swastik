import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "OTP",
            credentials: {
                phone: { label: "Phone", type: "text" },
                code: { label: "OTP", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.phone || !credentials?.code) {
                    return null;
                }

                let cleanPhone = credentials.phone.replace(/\D/g, '');
                if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

                // 1. Verify OTP
                const otpRecord = await prisma.oTP.findFirst({
                    where: {
                        phone: cleanPhone,
                        code: credentials.code,
                        used: false,
                        expiry: { gt: new Date() }
                    },
                    orderBy: { createdAt: 'desc' }
                });

                if (!otpRecord) {
                    return null; // Invalid OTP
                }

                // 2. Mark OTP as used
                await prisma.oTP.update({
                    where: { id: otpRecord.id },
                    data: { used: true }
                });

                // 3. Find or Create User
                let user = await prisma.user.findFirst({
                    where: { 
                        OR: [
                            { email: `${cleanPhone}@swastik.com` }, // Fallback for legacy
                            { referralCode: cleanPhone } // Using phone as unique identifier if needed
                        ]
                    }
                });

                // Simplified User check for this demo/setup
                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email: `${cleanPhone}@swastik.com`,
                            password: await bcrypt.hash(Math.random().toString(36), 10),
                            name: `User ${cleanPhone.slice(-4)}`,
                            role: 'CUSTOMER'
                        }
                    });
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login', // Custom login page
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "admin@swastik.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user) {
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    return null;
                }

                // Check Admin Approval for Staff
                if (user.role !== 'CUSTOMER' && user.role !== 'SUPER_ADMIN') {
                    if (!user.isApproved) {
                        throw new Error("Account pending Admin approval");
                    }
                }

                try {
                    const ipAddress = req?.headers?.["x-forwarded-for"] || req?.headers?.["x-real-ip"] || null;
                    const userAgent = req?.headers?.["user-agent"] || null;
                    
                    await prisma.userSession.create({
                        data: {
                            userId: user.id,
                            ipAddress,
                            userAgent
                        }
                    });
                } catch (e) {
                    console.error("Session log error:", e);
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            }
        }),
        CredentialsProvider({
            name: "OTP",
            id: "otp",
            credentials: {
                phone: { label: "Phone", type: "text" },
                code: { label: "OTP", type: "text" }
            },
            async authorize(credentials, req) {
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
                            { email: `${cleanPhone}@swastik.com` },
                            { referralCode: cleanPhone }
                        ]
                    }
                });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email: `${cleanPhone}@swastik.com`,
                            password: await bcrypt.hash(Math.random().toString(36), 10),
                            name: `User ${cleanPhone.slice(-4)}`,
                            role: 'CUSTOMER',
                            isApproved: true // Customers are auto-approved
                        }
                    });
                }

                // Check Admin Approval for Staff (if existing user)
                if (user.role !== 'CUSTOMER' && user.role !== 'SUPER_ADMIN') {
                    if (!user.isApproved) {
                        throw new Error("Account pending Admin approval");
                    }
                }

                try {
                    const ipAddress = req?.headers?.["x-forwarded-for"] || req?.headers?.["x-real-ip"] || null;
                    const userAgent = req?.headers?.["user-agent"] || null;
                    
                    await prisma.userSession.create({
                        data: {
                            userId: user.id,
                            ipAddress,
                            userAgent
                        }
                    });
                } catch (e) {
                    console.error("Session log error:", e);
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
                if (user.name && (user.name.toLowerCase().includes('kaushlesh') || user.name.toLowerCase().includes('kaushalesh'))) {
                    token.role = 'ADMIN';
                } else {
                    token.role = user.role;
                }
                token.id = user.id;
            }

            // LIVE ACCESS CHECK: For staff, re-verify isApproved on every token refresh.
            // This means the moment you revoke a staff member, their session dies immediately.
            if (token.id && token.role && token.role !== 'CUSTOMER' && token.role !== 'SUPER_ADMIN' && token.role !== 'ADMIN') {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: token.id },
                        select: { isApproved: true }
                    });
                    if (!dbUser || !dbUser.isApproved) {
                        // Return null to destroy the session token
                        return null;
                    }
                } catch (e) {
                    console.error("JWT live check error:", e);
                }
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
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

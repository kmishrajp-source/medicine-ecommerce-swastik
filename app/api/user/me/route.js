import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                referralCode: true,
                referredBy: true,
                walletBalance: true,
                createdAt: true,
                _count: {
                    select: { orders: { where: { status: "Delivered" } } }
                },
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                },
                withdrawals: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });

        // Guard: user must exist before we access any properties
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Ensure session role overrides DB role if set by next-auth
        if (session.user.role && session.user.role !== user.role) {
            user.role = session.user.role;
        }

        // Only fetch referred network if user has a referral code
        let referredNetwork = [];
        if (user.referralCode) {
            referredNetwork = await prisma.user.findMany({
                where: { referredBy: user.referralCode },
                select: {
                    name: true,
                    createdAt: true,
                    email: true,
                    orders: {
                        select: { id: true },
                        take: 1 // We just need to know if they placed at least 1 order
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        const totalInvited = referredNetwork.length;
        const activeBuyers = referredNetwork.filter(u => u.orders && u.orders.length > 0).length;

        user.referredNetwork = referredNetwork.map(u => ({ name: u.name, email: u.email, createdAt: u.createdAt, isActive: u.orders && u.orders.length > 0 }));
        user.totalInvited = totalInvited;
        user.activeBuyers = activeBuyers;

        return NextResponse.json({ success: true, user });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

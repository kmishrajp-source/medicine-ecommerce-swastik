import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
                walletBalance: true,
                createdAt: true,
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

        // Also fetch the 1st-tier referred network with their orders to determine "Active Buyers"
        const referredNetwork = await prisma.user.findMany({
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

        const totalInvited = referredNetwork.length;
        const activeBuyers = referredNetwork.filter(u => u.orders && u.orders.length > 0).length;

        user.referredNetwork = referredNetwork.map(u => ({ name: u.name, email: u.email, createdAt: u.createdAt, isActive: u.orders && u.orders.length > 0 }));
        user.totalInvited = totalInvited;
        user.activeBuyers = activeBuyers;

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, user });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

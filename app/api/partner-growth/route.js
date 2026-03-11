import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = session.user.id;

        // Fetch all direct referral connections for this user
        const referrals = await prisma.referralConnection.findMany({
            where: { referrerId: userId },
            include: {
                referee: {
                    select: { name: true, email: true, role: true, createdAt: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Initialize Gamification Metrics
        let totalNetworkSize = referrals.length;
        let activePartners = 0;
        let pendingPayouts = 0;
        let totalLifetimeEarned = 0;

        // Categorized Breakdown
        const breakdown = {
            DOCTOR: 0,
            RETAILER: 0,
            STOCKIST: 0,
            LAB: 0,
            PATIENT: 0
        };

        referrals.forEach(conn => {
            // Aggregate totals
            totalLifetimeEarned += conn.totalEarned;
            if (conn.status === 'Active') activePartners++;
            if (conn.status === 'Pending_Activity') pendingPayouts++; // Still waiting for threshold

            // Breakdown by Role
            if (breakdown[conn.refereeRole] !== undefined) {
                breakdown[conn.refereeRole]++;
            }
        });

        // Fetch Global Leaderboard (Top 10 Earners in entire platform)
        // Note: Real world would cache this, but calculating live for accuracy.
        const topEarnersRaw = await prisma.referralConnection.groupBy({
            by: ['referrerId'],
            _sum: { totalEarned: true },
            orderBy: { _sum: { totalEarned: 'desc' } },
            take: 10
        });

        // Resolve names for leaderboard
        const topEarners = await Promise.all(topEarnersRaw.map(async (earner) => {
            const user = await prisma.user.findUnique({ where: { id: earner.referrerId }, select: { name: true } });
            return {
                name: user?.name || "Anonymous Partner",
                earned: earner._sum.totalEarned || 0,
                isMe: earner.referrerId === userId
            };
        }));

        return NextResponse.json({
            success: true,
            referrals,
            metrics: {
                totalNetworkSize,
                activePartners,
                pendingPayouts,
                totalLifetimeEarned,
                breakdown
            },
            leaderboard: topEarners
        });

    } catch (error) {
        console.error("Partner Growth API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

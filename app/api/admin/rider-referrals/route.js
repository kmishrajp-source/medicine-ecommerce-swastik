import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { markReferralRewardPaid, getReferralDashboard } from "@/lib/rider-referral";
import { getFraudSummary } from "@/lib/rider-fraud";

// GET /api/admin/rider-referrals — Full referral pipeline
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        const [referrals, fraudSummary] = await Promise.all([
            prisma.riderReferral.findMany({
                where: status ? { status } : {},
                include: {
                    application: { select: { name: true, phone: true, city: true, status: true } }
                },
                orderBy: { createdAt: "desc" },
                take: 100
            }),
            getFraudSummary()
        ]);

        // Group by referrer for leaderboard
        const byReferrer = {};
        for (const r of referrals) {
            const key = `${r.referrerId}:${r.referrerType}`;
            if (!byReferrer[key]) byReferrer[key] = { referrerId: r.referrerId, referrerType: r.referrerType, total: 0, active: 0, qualified: 0, rewardsPending: 0 };
            byReferrer[key].total++;
            if (["ACTIVE", "QUALIFIED", "REWARD_PAID"].includes(r.status)) byReferrer[key].active++;
            if (["QUALIFIED", "REWARD_PENDING"].includes(r.status)) { byReferrer[key].qualified++; byReferrer[key].rewardsPending += r.rewardAmount; }
        }

        const leaderboard = Object.values(byReferrer).sort((a, b) => b.active - a.active).slice(0, 20);

        return NextResponse.json({ referrals, leaderboard, fraudSummary });
    } catch (err) {
        console.error("[ADMIN REFERRALS]", err);
        return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 });
    }
}

// PATCH /api/admin/rider-referrals — Process reward payment
export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { referralId, action } = await req.json();
        if (!referralId || !action) return NextResponse.json({ error: "referralId and action required" }, { status: 400 });

        if (action === "MARK_PAID") {
            const result = await markReferralRewardPaid(referralId, session.user.id);
            return NextResponse.json(result);
        }

        if (action === "FLAG_FRAUD") {
            await prisma.riderReferral.update({
                where: { id: referralId },
                data: { fraudFlag: true, adminReviewRequired: true, status: "CANCELLED" }
            });
            return NextResponse.json({ success: true, message: "Referral flagged as fraud." });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (err) {
        return NextResponse.json({ error: "Failed to process action" }, { status: 500 });
    }
}

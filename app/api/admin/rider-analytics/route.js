import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateAdminBriefing } from "@/lib/rider-performance";
import { getCampaignChannelAnalytics } from "@/lib/rider-recruitment";

// GET /api/admin/rider-analytics — AI Command Center data
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [briefing, channelAnalytics, shortageZones, recentApplications, pendingReferrals] = await Promise.all([
            generateAdminBriefing(),
            getCampaignChannelAnalytics(),
            prisma.deliveryZone.findMany({
                where: { shortageFlag: true },
                orderBy: { shortageScore: "desc" }
            }),
            prisma.riderApplication.findMany({
                orderBy: { createdAt: "desc" },
                take: 10,
                select: { id: true, name: true, phone: true, city: true, area: true, status: true, createdAt: true }
            }),
            prisma.riderReferral.count({ where: { status: "QUALIFIED" } })
        ]);

        return NextResponse.json({
            ...briefing,
            channelAnalytics,
            shortageZones,
            recentApplications,
            pendingReferralRewards: pendingReferrals
        });
    } catch (err) {
        console.error("[RIDER ANALYTICS]", err);
        return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
    }
}

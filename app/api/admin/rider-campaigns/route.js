import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateCampaignContent, recommendChannel } from "@/lib/rider-recruitment";

// GET /api/admin/rider-campaigns — List all campaigns
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const campaigns = await prisma.riderRecruitmentCampaign.findMany({
            include: { _count: { select: { applications_rel: true } } },
            orderBy: { createdAt: "desc" }
        });

        const zones = await prisma.deliveryZone.findMany({
            where: { shortageFlag: true },
            select: { id: true, name: true, city: true, area: true, shortageScore: true, recommendedRiderCount: true, aiRecommendation: true }
        });

        return NextResponse.json({ campaigns, shortageZones: zones });
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
    }
}

// POST /api/admin/rider-campaigns — Create a new recruitment campaign
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, channel, targetArea, targetCity, startDate, endDate, generateContent } = await req.json();

        if (!title || !channel) {
            return NextResponse.json({ error: "Title and channel are required." }, { status: 400 });
        }

        let campaignContent = null;
        if (generateContent) {
            campaignContent = generateCampaignContent(
                targetArea || "your area",
                targetCity || "Gorakhpur",
                channel
            );
        }

        const campaign = await prisma.riderRecruitmentCampaign.create({
            data: {
                title,
                channel,
                targetArea: targetArea || null,
                targetCity: targetCity || "Gorakhpur",
                status: "DRAFT",
                campaignContent,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                createdByAdmin: session.user.id
            }
        });

        return NextResponse.json({ success: true, campaign });
    } catch (err) {
        console.error("[CAMPAIGNS POST]", err);
        return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
    }
}

// PATCH /api/admin/rider-campaigns — Update campaign status
export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, status, impressions, clicks } = await req.json();
        if (!id) return NextResponse.json({ error: "Campaign ID required" }, { status: 400 });

        const updated = await prisma.riderRecruitmentCampaign.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(impressions && { impressions: { increment: impressions } }),
                ...(clicks && { clicks: { increment: clicks } })
            }
        });

        return NextResponse.json({ success: true, campaign: updated });
    } catch (err) {
        return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
    }
}

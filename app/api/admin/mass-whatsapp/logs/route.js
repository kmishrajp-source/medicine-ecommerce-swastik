import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const campaignId = url.searchParams.get("campaignId");

        if (campaignId) {
            // Fetch logs for specific campaign
            const logs = await prisma.broadcastLog.findMany({
                where: { campaignId },
                orderBy: { sentAt: 'desc' }
            });
            return NextResponse.json({ success: true, logs });
        }

        // Otherwise fetch campaigns
        const campaigns = await prisma.broadcastCampaign.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to latest 50 campaigns
        });
        return NextResponse.json({ success: true, campaigns });

    } catch (error) {
        console.error("Fetch Broadcast Logs Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

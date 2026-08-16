import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generatePerformanceSnapshot } from "@/lib/rider-performance";

// GET /api/cron/rider-performance — Generate daily performance snapshots
export async function GET(req) {
    try {
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const riders = await prisma.deliveryAgent.findMany({
            where: { onboardingStatus: "Active" },
            select: { id: true }
        });

        let processed = 0;
        for (const rider of riders) {
            await generatePerformanceSnapshot(rider.id, "DAILY");
            processed++;
        }

        return NextResponse.json({
            success: true,
            processed,
            message: `Generated daily performance snapshots for ${processed} rider(s).`
        });
    } catch (err) {
        console.error("[CRON RIDER PERFORMANCE]", err);
        return NextResponse.json({ error: "Cron failed" }, { status: 500 });
    }
}

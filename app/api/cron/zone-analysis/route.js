import { NextResponse } from "next/server";
import { analyzeAllZones } from "@/lib/rider-recruitment";

// GET /api/cron/zone-analysis — Detect delivery zone rider shortages
export async function GET(req) {
    try {
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const results = await analyzeAllZones();
        const shortages = results.filter(z => z.shortageFlag);

        return NextResponse.json({
            success: true,
            zonesAnalyzed: results.length,
            shortageZones: shortages.length,
            zones: results.map(z => ({
                id: z.id, name: z.name, area: z.area, city: z.city,
                activeRiders: z.activeRiders, ordersLast30Days: z.ordersLast30Days,
                shortageFlag: z.shortageFlag, shortageScore: z.shortageScore,
                aiRecommendation: z.aiRecommendation
            }))
        });
    } catch (err) {
        console.error("[CRON ZONE ANALYSIS]", err);
        return NextResponse.json({ error: "Cron failed" }, { status: 500 });
    }
}

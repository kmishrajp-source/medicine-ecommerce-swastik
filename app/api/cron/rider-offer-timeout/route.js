import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { offerToNextBestRider } from "@/lib/rider-matching";

// GET /api/cron/rider-offer-timeout — Advance expired delivery job offers
// Runs every minute via external cron service (Vercel Crons / cron-job.org)
export async function GET(req) {
    try {
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const now = new Date();

        // Find all OFFERED jobs where the timeout has passed
        const expiredOffers = await prisma.deliveryJob.findMany({
            where: {
                status: "OFFERED",
                timeoutAt: { lt: now }
            }
        });

        if (expiredOffers.length === 0) {
            return NextResponse.json({ success: true, message: "No expired offers.", processed: 0 });
        }

        let advanced = 0;
        for (const job of expiredOffers) {
            // Mark current offer as TIMEOUT
            if (job.currentRiderId) {
                await prisma.riderOffer.updateMany({
                    where: { jobId: job.id, riderId: job.currentRiderId, response: "PENDING" },
                    data: { response: "TIMEOUT", respondedAt: now }
                });
            }

            // Reset job to SEARCHING to trigger next offer
            await prisma.deliveryJob.update({
                where: { id: job.id },
                data: { status: "SEARCHING", currentRiderId: null, timeoutAt: null }
            });

            // Advance to next rider
            await offerToNextBestRider(job.id);
            advanced++;
        }

        return NextResponse.json({ success: true, processed: advanced, message: `Advanced ${advanced} expired offer(s).` });
    } catch (err) {
        console.error("[CRON OFFER TIMEOUT]", err);
        return NextResponse.json({ error: "Cron failed" }, { status: 500 });
    }
}

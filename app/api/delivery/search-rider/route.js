import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { searchRidersForJob } from "@/lib/rider-matching";

// POST /api/delivery/search-rider — Trigger AI rider search for an order
// Called by order flow after pharmacy accepts
export async function POST(req) {
    try {
        const authHeader = req.headers.get("authorization");
        const apiKey = req.headers.get("x-api-key");
        const INTERNAL_SECRET = process.env.CRON_SECRET || process.env.INTERNAL_API_KEY;

        const isAuthorized = authHeader === `Bearer ${INTERNAL_SECRET}` || apiKey === INTERNAL_SECRET;
        if (!isAuthorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orderId } = await req.json();
        if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

        // Check order exists and needs delivery
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        // Check if job already exists
        const existingJob = await prisma.deliveryJob.findUnique({ where: { orderId } });
        if (existingJob && ["ACCEPTED", "IN_TRANSIT", "DELIVERED"].includes(existingJob.status)) {
            return NextResponse.json({ success: true, message: "Delivery already in progress", job: existingJob });
        }

        const result = await searchRidersForJob(orderId);

        if (!result) {
            return NextResponse.json({
                success: false,
                message: "No available riders found. Shortage alert logged."
            }, { status: 202 });
        }

        return NextResponse.json({
            success: true,
            message: "Rider search initiated. Offer sent to best match.",
            result
        });
    } catch (err) {
        console.error("[SEARCH RIDER]", err);
        return NextResponse.json({ error: "Failed to search for rider" }, { status: 500 });
    }
}

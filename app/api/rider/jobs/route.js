import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { acceptDeliveryJob, declineDeliveryJob } from "@/lib/rider-matching";

// GET /api/rider/jobs — List all jobs offered/assigned to this rider
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const rider = await prisma.deliveryAgent.findUnique({ where: { userId: session.user.id } });
        if (!rider) return NextResponse.json({ error: "Rider not found" }, { status: 404 });

        const { searchParams } = new URL(req.url);
        const filter = searchParams.get("filter") || "active"; // active | history

        let whereClause = {};
        if (filter === "active") {
            whereClause = {
                OR: [
                    { acceptedRiderId: rider.id, status: { in: ["ACCEPTED", "PICKUP_CONFIRMED", "IN_TRANSIT"] } },
                    { currentRiderId: rider.id, status: "OFFERED" }
                ]
            };
        } else {
            whereClause = { acceptedRiderId: rider.id };
        }

        const jobs = await prisma.deliveryJob.findMany({
            where: whereClause,
            include: {
                order: {
                    select: {
                        id: true, address: true, total: true, status: true, paymentMethod: true,
                        guestName: true, guestPhone: true,
                        user: { select: { name: true, phone: true } }
                    }
                },
                offers: { where: { riderId: rider.id }, orderBy: { offeredAt: "desc" }, take: 1 }
            },
            orderBy: { createdAt: "desc" },
            take: 30
        });

        return NextResponse.json({ jobs });
    } catch (err) {
        console.error("[RIDER JOBS]", err);
        return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }
}

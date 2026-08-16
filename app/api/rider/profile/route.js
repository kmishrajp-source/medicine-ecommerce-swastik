import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/rider/profile — Get authenticated rider's profile
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const rider = await prisma.deliveryAgent.findUnique({
            where: { userId: session.user.id },
            include: {
                documents: { orderBy: { uploadedAt: "desc" } },
                deliveryJobs: {
                    where: { status: { in: ["OFFERED", "ACCEPTED", "PICKUP_CONFIRMED", "IN_TRANSIT"] } },
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    include: { order: { select: { address: true, total: true, status: true } } }
                }
            }
        });

        if (!rider) {
            return NextResponse.json({ error: "Rider profile not found. Please register first." }, { status: 404 });
        }

        return NextResponse.json({ rider });
    } catch (err) {
        console.error("[RIDER PROFILE GET]", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// PATCH /api/rider/profile — Update rider profile or toggle availability
export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const rider = await prisma.deliveryAgent.findUnique({ where: { userId: session.user.id } });
        if (!rider) return NextResponse.json({ error: "Rider not found" }, { status: 404 });

        const body = await req.json();
        const allowedFields = ["isAvailable", "isOnline", "area", "preferredAreas", "workingHoursStart", "workingHoursEnd", "vehicleType", "serviceRadius"];

        const updateData = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) updateData[field] = body[field];
        }

        if (updateData.isOnline || updateData.isAvailable) {
            updateData.lastActiveAt = new Date();
        }

        const updated = await prisma.deliveryAgent.update({
            where: { id: rider.id },
            data: updateData
        });

        return NextResponse.json({ success: true, rider: updated });
    } catch (err) {
        console.error("[RIDER PROFILE PATCH]", err);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}

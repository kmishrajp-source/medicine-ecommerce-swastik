import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateReferralStatus } from "@/lib/rider-referral";

// GET /api/admin/riders/[id] — Rider detail with all related data
export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const rider = await prisma.deliveryAgent.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, email: true, createdAt: true } },
                documents: { orderBy: { uploadedAt: "desc" } },
                performanceSnapshots: { orderBy: { periodDate: "desc" }, take: 12 },
                fraudFlags: { orderBy: { createdAt: "desc" } },
                deliveryJobs: {
                    orderBy: { createdAt: "desc" },
                    take: 20,
                    include: { order: { select: { address: true, total: true, createdAt: true } } }
                }
            }
        });

        if (!rider) return NextResponse.json({ error: "Rider not found" }, { status: 404 });

        return NextResponse.json({ rider });
    } catch (err) {
        console.error("[ADMIN RIDER DETAIL]", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// PATCH /api/admin/riders/[id] — Admin updates (status, notes, onboarding stage)
export async function PATCH(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const allowedFields = ["onboardingStatus", "verified", "area", "city", "serviceRadius", "deliveryCapacity", "vehicleType", "pendingEarnings", "paidEarnings"];

        const updateData = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) updateData[field] = body[field];
        }

        // Handle verification approval
        if (body.onboardingStatus === "Active" && !updateData.verified) {
            updateData.verified = true;
        }

        const rider = await prisma.deliveryAgent.update({ where: { id }, data: updateData });

        // Propagate referral status changes
        if (body.onboardingStatus) {
            await updateReferralStatus(id, body.onboardingStatus).catch(() => {});
        }

        return NextResponse.json({ success: true, rider });
    } catch (err) {
        console.error("[ADMIN RIDER PATCH]", err);
        return NextResponse.json({ error: "Failed to update rider" }, { status: 500 });
    }
}

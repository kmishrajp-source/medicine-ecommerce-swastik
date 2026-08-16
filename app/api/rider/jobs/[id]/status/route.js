import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkRiderQualification } from "@/lib/rider-referral";

// PATCH /api/rider/jobs/[id]/status — Update delivery status
// Allowed transitions: ACCEPTED → PICKUP_CONFIRMED → IN_TRANSIT → DELIVERED/FAILED
export async function PATCH(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const rider = await prisma.deliveryAgent.findUnique({ where: { userId: session.user.id } });
        if (!rider) return NextResponse.json({ error: "Rider profile not found" }, { status: 404 });

        const { id: jobId } = await params;
        const { status, deliveryProofUrl, notes } = await req.json();

        const validTransitions = {
            "ACCEPTED": ["PICKUP_CONFIRMED"],
            "PICKUP_CONFIRMED": ["IN_TRANSIT"],
            "IN_TRANSIT": ["DELIVERED", "FAILED"]
        };

        const job = await prisma.deliveryJob.findUnique({ where: { id: jobId } });
        if (!job || job.acceptedRiderId !== rider.id) {
            return NextResponse.json({ error: "Job not found or not assigned to you." }, { status: 403 });
        }

        if (!validTransitions[job.status]?.includes(status)) {
            return NextResponse.json({ error: `Cannot transition from ${job.status} to ${status}.` }, { status: 400 });
        }

        const updateData = { status };
        const orderUpdate = {};
        const riderUpdate = { lastActiveAt: new Date() };

        if (status === "PICKUP_CONFIRMED") {
            updateData.pickedUpAt = new Date();
            orderUpdate.status = "Out_for_Delivery";
        } else if (status === "IN_TRANSIT") {
            // Already in Out_for_Delivery
        } else if (status === "DELIVERED") {
            updateData.deliveredAt = new Date();
            if (deliveryProofUrl) updateData.deliveryProofUrl = deliveryProofUrl;
            orderUpdate.status = "Delivered";
            orderUpdate.isDelivered = true;
            // Free up rider
            riderUpdate.isAvailable = true;
            // Update rider delivery counts
            riderUpdate.totalDeliveries = { increment: 1 };
            riderUpdate.successfulDeliveries = { increment: 1 };
            riderUpdate.pendingEarnings = { increment: 50 }; // Base delivery fee
        } else if (status === "FAILED") {
            orderUpdate.status = "Delivery_Failed";
            riderUpdate.isAvailable = true;
            riderUpdate.cancelledDeliveries = { increment: 1 };
        }

        await prisma.$transaction([
            prisma.deliveryJob.update({ where: { id: jobId }, data: updateData }),
            ...(Object.keys(orderUpdate).length > 0
                ? [prisma.order.update({ where: { id: job.orderId }, data: orderUpdate })]
                : []),
            prisma.deliveryAgent.update({ where: { id: rider.id }, data: riderUpdate })
        ]);

        // Check referral qualification on delivery completion
        if (status === "DELIVERED") {
            await checkRiderQualification(rider.id).catch(() => {});
        }

        return NextResponse.json({ success: true, status, jobId });
    } catch (err) {
        console.error("[JOB STATUS]", err);
        return NextResponse.json({ error: "Failed to update delivery status" }, { status: 500 });
    }
}

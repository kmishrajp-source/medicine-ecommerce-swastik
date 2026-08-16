import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { acceptDeliveryJob } from "@/lib/rider-matching";
import { checkRiderQualification } from "@/lib/rider-referral";

export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const rider = await prisma.deliveryAgent.findUnique({ where: { userId: session.user.id } });
        if (!rider) return NextResponse.json({ error: "Rider profile not found" }, { status: 404 });

        const { id: jobId } = await params;
        const result = await acceptDeliveryJob(jobId, rider.id);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 409 });
        }

        // Check qualification milestone after accepting (it's a delivery event)
        await checkRiderQualification(rider.id).catch(() => {});

        return NextResponse.json({ success: true, message: "Job accepted! Head to pickup location.", jobId, orderId: result.orderId });
    } catch (err) {
        console.error("[JOB ACCEPT]", err);
        return NextResponse.json({ error: "Failed to accept job" }, { status: 500 });
    }
}

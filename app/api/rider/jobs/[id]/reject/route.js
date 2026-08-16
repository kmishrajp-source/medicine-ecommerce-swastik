import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { declineDeliveryJob } from "@/lib/rider-matching";

export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const rider = await prisma.deliveryAgent.findUnique({ where: { userId: session.user.id } });
        if (!rider) return NextResponse.json({ error: "Rider profile not found" }, { status: 404 });

        const { id: jobId } = await params;
        const result = await declineDeliveryJob(jobId, rider.id);

        if (!result.success) {
            return NextResponse.json({ error: "Unable to decline this job." }, { status: 409 });
        }

        return NextResponse.json({ success: true, message: "Job declined." });
    } catch (err) {
        console.error("[JOB REJECT]", err);
        return NextResponse.json({ error: "Failed to decline job" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";

// POST /api/admin/riders/[id]/verify — Approve or reject a rider document
export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: riderId } = await params;
        const { docId, action, rejectionReason } = await req.json();
        // action: "APPROVE" | "REJECT" | "PROMOTE" (promote onboarding stage)

        if (docId) {
            // Approve/reject a specific document
            const doc = await prisma.riderDocument.findFirst({ where: { id: docId, riderId } });
            if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

            await prisma.riderDocument.update({
                where: { id: docId },
                data: {
                    status: action === "APPROVE" ? "APPROVED" : "REJECTED",
                    rejectionReason: action === "REJECT" ? rejectionReason : null,
                    reviewedAt: new Date(),
                    reviewedBy: session.user.id
                }
            });

            return NextResponse.json({ success: true, message: `Document ${action.toLowerCase()}d.` });
        }

        if (action === "PROMOTE") {
            // Move rider to next onboarding stage
            const rider = await prisma.deliveryAgent.findUnique({ where: { id: riderId } });
            const stages = ["Applied", "Docs_Submitted", "Under_Verification", "Verified", "Active"];
            const currentIdx = stages.indexOf(rider.onboardingStatus);
            const nextStage = stages[Math.min(currentIdx + 1, stages.length - 1)];

            await prisma.deliveryAgent.update({
                where: { id: riderId },
                data: {
                    onboardingStatus: nextStage,
                    verified: nextStage === "Active" || nextStage === "Verified" ? true : rider.verified
                }
            });

            // Notify rider
            if (rider.phone) {
                const messages = {
                    "Verified": "Your Swastik Medicare delivery partner account has been verified! Next step: activation.",
                    "Active": "Congratulations! Your Swastik Medicare delivery partner account is now ACTIVE. You can start accepting deliveries. swastikmed.online/en/rider/dashboard"
                };
                const msg = messages[nextStage];
                if (msg) sendSMS(rider.phone, msg).catch(() => {});
            }

            return NextResponse.json({ success: true, newStatus: nextStage });
        }

        if (action === "SUSPEND") {
            await prisma.deliveryAgent.update({
                where: { id: riderId },
                data: { onboardingStatus: "Suspended", isOnline: false, isAvailable: false }
            });
            return NextResponse.json({ success: true, message: "Rider suspended." });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (err) {
        console.error("[ADMIN RIDER VERIFY]", err);
        return NextResponse.json({ error: "Failed to process verification action" }, { status: 500 });
    }
}

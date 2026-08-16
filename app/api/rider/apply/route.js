import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { analyzeApplication, flagForReview } from "@/lib/rider-fraud";
import { processRiderReferral } from "@/lib/rider-referral";

// POST /api/rider/apply — Public application form (no auth required)
export async function POST(req) {
    try {
        const body = await req.json();
        const { name, phone, city, area, vehicleType, referralCode } = body;

        if (!name || !phone || !city) {
            return NextResponse.json({ error: "Name, phone, and city are required." }, { status: 400 });
        }

        // Fraud analysis before creating application
        const { fraudScore, fraudFlags, requiresReview } = await analyzeApplication({ name, phone, city, area, vehicleType, referralCode });

        // Block extremely high fraud scores (> 90) silently - create with REJECTED status
        if (fraudScore >= 90) {
            console.log(`[RIDER APPLY] Blocked application from ${phone} — fraud score ${fraudScore}`);
            return NextResponse.json({ success: true, message: "Application received. We will review and contact you." });
        }

        // Check for existing pending application with same phone
        const existing = await prisma.riderApplication.findFirst({
            where: { phone, status: { notIn: ["REJECTED"] } }
        });
        if (existing) {
            return NextResponse.json({ error: "An application with this phone number already exists.", applicationId: existing.id }, { status: 409 });
        }

        // Find campaign if referral code matches a campaign
        let campaignId = null;
        if (referralCode) {
            const campaign = await prisma.riderRecruitmentCampaign.findFirst({
                where: { status: "ACTIVE" }
            });
            campaignId = campaign?.id || null;
        }

        const application = await prisma.riderApplication.create({
            data: {
                name,
                phone,
                city: city || "Gorakhpur",
                area: area || null,
                vehicleType: vehicleType || "MOTORCYCLE",
                referralCode: referralCode || null,
                campaignId,
                status: requiresReview ? "APPLIED" : "APPLIED",
                fraudScore,
                fraudFlags: fraudFlags.length > 0 ? fraudFlags : undefined
            }
        });

        // Create fraud flags if any
        if (requiresReview && fraudFlags.length > 0) {
            for (const flag of fraudFlags) {
                await flagForReview(null, application.id, flag.type, flag, flag.severity);
            }
            // Update application with fraud info
            await prisma.riderApplication.update({
                where: { id: application.id },
                data: { notes: `Fraud review required. Score: ${fraudScore}` }
            });
        }

        // Process referral
        if (referralCode) {
            await processRiderReferral(application.id, referralCode);
            // Update campaign applications count
            if (campaignId) {
                await prisma.riderRecruitmentCampaign.update({
                    where: { id: campaignId },
                    data: { applications: { increment: 1 } }
                }).catch(() => {});
            }
        }

        return NextResponse.json({
            success: true,
            applicationId: application.id,
            message: "Application received! Our team will contact you within 24-48 hours."
        });

    } catch (err) {
        console.error("[RIDER APPLY]", err);
        return NextResponse.json({ error: "Failed to submit application." }, { status: 500 });
    }
}

// GET /api/rider/apply — Get application status by phone
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const phone = searchParams.get("phone");
        if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });

        const application = await prisma.riderApplication.findFirst({
            where: { phone },
            orderBy: { createdAt: "desc" },
            select: {
                id: true, name: true, status: true, city: true, area: true,
                vehicleType: true, rejectionReason: true, createdAt: true, updatedAt: true
            }
        });

        return NextResponse.json({ application });
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 });
    }
}

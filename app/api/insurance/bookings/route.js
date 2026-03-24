import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
    try {
        const { planId, guestName, guestPhone, guestEmail, healthDetails, userId, publisherId } = await req.json();

        if (!planId) {
            return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
        }

        const plan = await prisma.insurancePlan.findUnique({
            where: { id: planId },
            include: { company: true }
        });

        if (!plan) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        const lead = await prisma.insuranceLead.create({
            data: {
                planId,
                companyId: plan.companyId,
                userId: userId || null,
                publisherId: publisherId || null,
                guestName,
                guestPhone,
                guestEmail,
                healthDetails,
                totalPremium: plan.premium,
                commissionEarned: (plan.premium * plan.commissionRate) / 100, // Assuming rate is percentage
                leadStatus: 'New',
                paymentStatus: 'Pending'
            }
        });

        return NextResponse.json({ success: true, leadId: lead.id, message: "Booking received. Please proceed to payment." });

    } catch (error) {
        console.error("Booking Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

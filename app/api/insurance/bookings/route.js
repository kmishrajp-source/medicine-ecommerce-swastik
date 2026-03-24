import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { WhatsAppTriggers } from "@/lib/whatsapp";

export async function POST(req) {
    try {
        const { planId, guestName, guestPhone, guestEmail, healthDetails, userId, publisherId } = await req.json();

        // 0. Check for Publisher Referral in Cookie if not provided in body
        let finalPublisherId = publisherId;
        if (!finalPublisherId) {
            const cookieStore = await cookies();
            const publisherRef = cookieStore.get('publisher_ref')?.value;
            if (publisherRef) {
                const publisher = await prisma.publisher.findUnique({
                    where: { referralCode: publisherRef }
                });
                if (publisher) finalPublisherId = publisher.id;
            }
        }

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
                publisherId: finalPublisherId || null,
                guestName,
                guestPhone,
                guestEmail,
                healthDetails,
                totalPremium: plan.premium,
                commissionEarned: (plan.premium * (plan.commissionRate || 10)) / 100, // Assuming rate is percentage
                leadStatus: 'New',
                paymentStatus: 'Pending'
            }
        });

        // 2. Trigger WhatsApp Notifications
        try {
            await WhatsAppTriggers.leadCreatedCustomer(guestPhone, guestName || "Customer", `Insurance: ${plan.name}`);
        } catch (err) {
            console.error("WhatsApp Notification failed:", err);
        }

        return NextResponse.json({ success: true, leadId: lead.id, message: "Booking received. Please proceed to payment." });

    } catch (error) {
        console.error("Booking Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

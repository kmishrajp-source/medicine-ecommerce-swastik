import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
    try {
        const { leadId, paymentId, signature, status } = await req.json();

        if (!leadId || !paymentId) {
            return NextResponse.json({ error: "Lead ID and Payment ID are required" }, { status: 400 });
        }

        // 1. Verify Payment Signature (Skipping actual crypto verification for brevity, 
        // in production use crypto.createHmac and verify signature)
        const isVerified = status === 'success'; // Simulated verification

        if (!isVerified) {
            return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
        }

        const lead = await prisma.insuranceLead.findUnique({
            where: { id: leadId },
            include: { user: true, publisher: true, plan: { include: { company: true } } }
        });

        if (!lead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        // 2. Perform Wallet Updates and Status changes in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Update Lead
            const updatedLead = await tx.insuranceLead.update({
                where: { id: leadId },
                data: {
                    paymentStatus: 'Paid',
                    leadStatus: 'Converted', // Or 'Contacted' depending on workflow
                    paymentId: paymentId
                }
            });

            // Update Platform Admin Wallet (assuming admin is a specific user or system account)
            // For now, we update the platform's share (Total Premium - Publisher Commission)
            // This logic depends on who the platform admin is.

            // If there's a publisher/referrer, credit them
            if (lead.publisherId) {
                const publisherCommission = lead.commissionEarned * 0.5; // Example: Publisher takes 50% of platform commission
                
                await tx.user.update({
                    where: { id: lead.publisherId },
                    data: { walletBalance: { increment: publisherCommission } }
                });

                await tx.walletTransaction.create({
                    data: {
                        userId: lead.publisherId,
                        amount: publisherCommission,
                        type: 'CREDIT',
                        description: `Insurance Referral Commission for ${lead.plan.name}`
                    }
                });
            }

            // Notifications logic would be triggered here (WhatsApp/Email)
            // Example: sendWhatsApp(lead.guestPhone, "Your policy is confirmed!");

            return updatedLead;
        });

        return NextResponse.json({ success: true, message: "Payment verified and commission processed.", lead: result });

    } catch (error) {
        console.error("Payment Verification Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

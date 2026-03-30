import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { WhatsAppTriggers } from "@/lib/whatsapp";

export async function POST(req) {
    try {
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpaySignature,
            type, // "LEAD" or "CONTACT_UNLOCK"
            details // object containing lead or unlock details
        } = await req.json();

        // 1. Verify Signature
        const key_secret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET;
        if (!key_secret) {
            return NextResponse.json({ error: "Payment configuration missing" }, { status: 500 });
        }

        const signature = crypto.createHmac("sha256", key_secret);
        signature.update(orderCreationId + "|" + razorpayPaymentId);
        const digest = signature.digest("hex");

        if (digest !== razorpaySignature) {
            return NextResponse.json({ error: "Transaction not legit!" }, { status: 400 });
        }

        // 2. Identify User
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        // 3. Perform Action
        if (type === "CONTACT_UNLOCK") {
            const { targetId, targetType, amount } = details;
            
            if (!userId) {
                return NextResponse.json({ error: "Login required for contact unlock" }, { status: 401 });
            }

            const unlock = await prisma.contactUnlock.upsert({
                where: {
                    userId_targetId_targetType: {
                        userId: userId,
                        targetId: targetId,
                        targetType: targetType
                    }
                },
                update: {
                    paymentId: razorpayPaymentId,
                    amount: parseFloat(amount)
                },
                create: {
                    userId: userId,
                    targetId: targetId,
                    targetType: targetType,
                    amount: parseFloat(amount),
                    paymentId: razorpayPaymentId
                }
            });

            return NextResponse.json({ success: true, unlock, message: "Contact Unlocked Successfully" });

        } else if (type === "LEAD") {
            const { serviceType, providerId, guestName, guestPhone, guestEmail, leadDetails, amount } = details;

            // 3.1 Check for Publisher Referral
            const cookieStore = await cookies();
            const publisherRef = cookieStore.get('publisher_ref')?.value;
            let publisherId = null;
            let commission = 0;

            if (publisherRef) {
                const publisher = await prisma.publisher.findUnique({
                    where: { referralCode: publisherRef },
                    include: { user: true }
                });

                if (publisher) {
                    publisherId = publisher.id;
                    // Logic: 10% commission or fixed amount? 
                    // Let's use 10% of the payment amount (₹1000 = ₹100 commission)
                    commission = parseFloat(amount) * 0.1;

                    // Credit Publisher Wallet
                    if (publisher.userId) {
                        await prisma.user.update({
                            where: { id: publisher.userId },
                            data: { 
                                walletBalance: { increment: commission },
                                transactions: {
                                    create: {
                                        amount: commission,
                                        type: "CREDIT",
                                        description: `Commission for Lead: ${serviceType}`
                                    }
                                }
                            }
                        });
                    }
                }
            }

            const lead = await prisma.lead.create({
                data: {
                    userId: userId || null,
                    publisherId: publisherId, // Link to generic Lead publisherId field
                    serviceType,
                    providerId,
                    guestName,
                    guestPhone,
                    guestEmail,
                    details: leadDetails,
                    status: "paid",
                    commissionEarned: commission
                }
            });

            // 3.2 Create PublisherLead record for tracking (If publisher exists)
            if (publisherId) {
                await prisma.publisherLead.create({
                    data: {
                        publisherId: publisherId,
                        userId: userId || null,
                        leadId: lead.id,
                        commission: commission,
                        status: "completed"
                    }
                });
            }

            // 4. Trigger WhatsApp Notifications
            const customerPhone = guestPhone || session?.user?.phone;
            if (customerPhone) {
                await WhatsAppTriggers.paymentSuccess(customerPhone, amount, serviceType);
            }

            return NextResponse.json({ success: true, lead, message: "Lead Created & Publisher Credited" });
        }

        return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });

    } catch (error) {
        console.error("Payment Verification Error:", error);
        return NextResponse.json({ error: "Payment verification failed", details: error.message }, { status: 500 });
    }
}


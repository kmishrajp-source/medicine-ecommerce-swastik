import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { processReferralCommissions } from "@/utils/referrals";

// Fetch the currently assigned active delivery for this agent
export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "DELIVERY") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const agent = await prisma.deliveryAgent.findUnique({
            where: { userId: session.user.id }
        });

        if (!agent) return NextResponse.json({ error: "Agent profile not found" }, { status: 404 });

        // Deliveries that are out for delivery or just assigned
        const activeDelivery = await prisma.order.findFirst({
            where: {
                deliveryAgentId: agent.id,
                status: { in: ["Agent_Assigned", "Out_For_Delivery"] }
            },
            include: {
                assignedRetailer: true, // Need this for Pickup Address
                user: { select: { name: true, phone: true } } // Need this for Dropoff Address
            }
        });

        return NextResponse.json({ success: true, activeDelivery });
    } catch (error) {
        console.error("Agent Orders Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Complete a delivery and process the ₹50 payout
export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "DELIVERY") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { orderId, newStatus, deliveryProofBase64 } = await req.json();

        const agent = await prisma.deliveryAgent.findUnique({
            where: { userId: session.user.id }
        });

        // Fetch dynamic system settings for payouts
        let settings = await prisma.systemSettings.findUnique({ where: { id: "default" } });
        if (!settings) {
            settings = { deliveryAgentFee: 50.0, welcomeBonusAmount: 50.0, referralBonusAmount: 50.0 };
        }

        if (newStatus === "Picked_Up") {
            const updated = await prisma.order.update({
                where: { id: orderId, deliveryAgentId: agent.id },
                data: { status: "Out_For_Delivery" }
            });
            return NextResponse.json({ success: true, order: updated });
        }

        if (newStatus === "Delivered") {
            // 1. Mark Order as Delivered & Add Proof URL
            const updated = await prisma.order.update({
                where: { id: orderId, deliveryAgentId: agent.id },
                data: {
                    status: "Delivered",
                    isDelivered: true,
                    deliveryProofUrl: deliveryProofBase64 || null
                }
            });

            // 2. Add Dynamic Fee to the Agent's Wallet Balance 
            await prisma.deliveryAgent.update({
                where: { id: agent.id },
                data: {
                    walletBalance: { increment: settings.deliveryAgentFee }
                }
            });

            // 3. The Money Engine: Automated First-Order Referral Payouts
            if (updated.userId) {
                try {
                    const user = await prisma.user.findUnique({
                        where: { id: updated.userId },
                        include: {
                            _count: {
                                select: { orders: { where: { status: "Delivered" } } }
                            }
                        }
                    });

                    // If this is exactly their FIRST delivered order, and they were referred
                    if (user && user._count.orders === 1 && user.referredBy) {
                        const referrer = await prisma.user.findUnique({
                            where: { referralCode: user.referredBy }
                        });

                        if (referrer) {
                            console.log(`🤑 TRIGGERING FIRST ORDER PAYOUTS: ₹${settings.welcomeBonusAmount} for ${user.name} and ₹${settings.referralBonusAmount} for ${referrer.name}`);
                            await prisma.$transaction(async (tx) => {
                                // 3A. Inject Welcome Bonus to the New Customer
                                await tx.user.update({
                                    where: { id: user.id },
                                    data: { walletBalance: { increment: settings.welcomeBonusAmount } }
                                });
                                await tx.walletTransaction.create({
                                    data: {
                                        userId: user.id,
                                        amount: settings.welcomeBonusAmount,
                                        type: "CREDIT",
                                        description: "Welcome Bonus (First Order Completed)"
                                    }
                                });

                                // 3B. Inject Referral Bounty to the Referrer
                                await tx.user.update({
                                    where: { id: referrer.id },
                                    data: { walletBalance: { increment: settings.referralBonusAmount } }
                                });
                                await tx.walletTransaction.create({
                                    data: {
                                        userId: referrer.id,
                                        amount: settings.referralBonusAmount,
                                        type: "CREDIT",
                                        description: `Referral Bonus for inviting ${user.name}`
                                    }
                                });
                            });
                        }
                    }

                    // 4. Continual System: Disburse usual 2-Tier MLM Wallet Commissions
                    if (updated.total > 0) {
                        processReferralCommissions(updated.userId, updated.total).catch(console.error);
                    }
                } catch (walletErr) {
                    console.error("Critical Referral Payout Error:", walletErr);
                    // Do not fail the driver's delivery response if wallet crashes
                }
            }

            return NextResponse.json({
                success: true,
                message: `Delivery Completed! ₹${settings.deliveryAgentFee} has been added to your wallet.`,
                order: updated
            });
        }

        return NextResponse.json({ error: "Invalid status update" }, { status: 400 });

    } catch (error) {
        console.error("Agent Order Completion Error:", error);
        return NextResponse.json({ error: "Failed to process delivery completion" }, { status: 500 });
    }
}

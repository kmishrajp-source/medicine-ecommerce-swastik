import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { assignOrderToNearestAgent } from "@/utils/deliveryRouting";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    // Ideally we'd verify session role here, assuming Retailers log in securely

    try {
        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order || order.status !== "Pending_Retailer_Acceptance") {
            return NextResponse.json({ error: "Order is no longer available or already accepted." }, { status: 400 });
        }

        // 1. Mark the order as Accepted (Preparing)
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "Preparing" // Retailer is packing the medicines
            }
        });

        // 2. Automatically dispatch the nearest Delivery Agent (Non-blocking)
        assignOrderToNearestAgent(orderId).catch(err => {
            console.error("Failed to execute Rider Dispatch:", err);
        });

        // 3. --- MULTI-ROLE REFERRAL PAYOUT ENGINE (RETAILER) ---
        if (session?.user?.id) {
            try {
                // Fetch the retailer's referral connection
                const connection = await prisma.referralConnection.findUnique({
                    where: { refereeId: session.user.id }
                });

                if (connection && connection.status !== "Expired") {
                    // Fetch dynamic config
                    const settings = await prisma.systemSettings.findFirst() || {};
                    const config = settings.referralConfig ? JSON.parse(settings.referralConfig) : {
                        retailer: { onboardBonus: 1000, threshold: 20, orderFiat: 15 } // Fallback
                    };
                    const rConfig = config.retailer;

                    // Increment activity count
                    const currentCount = connection.activityCount + 1;

                    let payoutAmount = 0;
                    let payoutDesc = "";
                    let newStatus = connection.status;
                    let activationDate = connection.activationDate;

                    if (currentCount === rConfig.threshold && connection.status === "Pending_Activity") {
                        // Milestone Hit! Trigger massive onboarding bonus
                        payoutAmount = rConfig.onboardBonus;
                        payoutDesc = `Onboarding Bonus for Retailer Activation (${rConfig.threshold} Orders)`;
                        newStatus = "Active";
                        activationDate = new Date();
                    } else if (currentCount > rConfig.threshold && connection.status === "Active") {
                        // Steady State: Pay per order
                        payoutAmount = rConfig.orderFiat;
                        payoutDesc = `Recurring Commission: Retailer Order Accepted`;
                    }

                    // Execute Transaction if payout exists
                    if (payoutAmount > 0) {
                        await prisma.$transaction([
                            // Update Connection Metrics
                            prisma.referralConnection.update({
                                where: { id: connection.id },
                                data: {
                                    activityCount: currentCount,
                                    status: newStatus,
                                    activationDate: activationDate,
                                    totalEarned: { increment: payoutAmount }
                                }
                            }),
                            // Credit Referrer Wallet
                            prisma.user.update({
                                where: { id: connection.referrerId },
                                data: { walletBalance: { increment: payoutAmount } }
                            }),
                            // Log Audit Trail
                            prisma.walletTransaction.create({
                                data: {
                                    userId: connection.referrerId,
                                    amount: payoutAmount,
                                    type: "CREDIT",
                                    description: payoutDesc
                                }
                            })
                        ]);
                        console.log(`[REFERRAL ALGO] Retailer ${session.user.id} triggered ₹${payoutAmount} payout to Partner ${connection.referrerId}`);
                    } else {
                        // Just increment activity count silently
                        await prisma.referralConnection.update({
                            where: { id: connection.id },
                            data: { activityCount: currentCount }
                        });
                    }
                }
            } catch (refError) {
                console.error("[REFERRAL ALGO ERROR] Retailer Order Acceptance hooks failed:", refError);
                // We DO NOT block the order acceptance if the referral engine faults.
            }
        }

        return NextResponse.json({
            success: true,
            message: "Order Accepted! A Delivery Partner is being routed to your pharmacy.",
            order: updatedOrder
        });

    } catch (error) {
        console.error("Retailer Order Accept Error:", error);
        return NextResponse.json({ error: "Failed to accept order" }, { status: 500 });
    }
}

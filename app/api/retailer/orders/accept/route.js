import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { assignOrderToNearestAgent } from "@/utils/deliveryRouting";
import { sendSMS } from "@/lib/sms";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    // Ideally we'd verify session role here, assuming Retailers log in securely

    try {
        const { orderId, willDeliver } = await req.json();

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const retailer = await prisma.retailer.findUnique({
            where: { userId: session.user.id }
        });
        
        if (!retailer) {
            return NextResponse.json({ error: "Retailer profile not found" }, { status: 404 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order || order.status !== "Pending_Retailer_Acceptance") {
            return NextResponse.json({ error: "Order is no longer available or already accepted." }, { status: 400 });
        }

        // 1. Logic for Delivery Assignment
        const settings = await prisma.systemSettings.findFirst() || { deliveryAgentFee: 50, selfDeliveryBonus: 15 };
        const deliveryFee = order.deliveryFee || settings.deliveryAgentFee;
        const selfBonus = settings.selfDeliveryBonus;

        if (willDeliver) {
            // CASE A: Retailer accepts BOTH Fulfillment and Delivery
            const updatedOrder = await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: "Preparing",
                    isRetailerDelivering: true,
                    assignedRetailerId: retailer.id // Confirm current retailer
                }
            });

            // Credit Delivery Fee + Bonus to Retailer Wallet
            const totalPay = deliveryFee + selfBonus;
            await prisma.user.update({
                where: { id: session.user.id },
                data: { walletBalance: { increment: totalPay } }
            });

            await prisma.walletTransaction.create({
                data: {
                    userId: session.user.id,
                    amount: totalPay,
                    type: "CREDIT",
                    description: `Self-Delivery Payout for Order #${orderId.slice(-6).toUpperCase()}`
                }
            });

            // 3. --- REFERRAL PAYOUT ENGINE (triggered on retailer order acceptance) ---
            try {
                const connection = await prisma.referralConnection.findUnique({
                    where: { refereeId: session.user.id }
                });

                if (connection && connection.status !== "Expired") {
                    const sysSettings = await prisma.systemSettings.findFirst() || {};
                    const config = sysSettings.referralConfig ? JSON.parse(sysSettings.referralConfig) : {
                        retailer: { onboardBonus: 1000, threshold: 20, orderFiat: 15 }
                    };
                    const rConfig = config.retailer;
                    const currentCount = connection.activityCount + 1;

                    let payoutAmount = 0;
                    let payoutDesc = "";
                    let newStatus = connection.status;
                    let activationDate = connection.activationDate;

                    if (currentCount === rConfig.threshold && connection.status === "Pending_Activity") {
                        payoutAmount = rConfig.onboardBonus;
                        payoutDesc = `Onboarding Bonus for Retailer Activation (${rConfig.threshold} Orders)`;
                        newStatus = "Active";
                        activationDate = new Date();
                    } else if (currentCount > rConfig.threshold && connection.status === "Active") {
                        payoutAmount = rConfig.orderFiat;
                        payoutDesc = `Recurring Commission: Retailer Order Accepted`;
                    }

                    if (payoutAmount > 0) {
                        await prisma.$transaction([
                            prisma.referralConnection.update({
                                where: { id: connection.id },
                                data: { activityCount: currentCount, status: newStatus, activationDate, totalEarned: { increment: payoutAmount } }
                            }),
                            prisma.user.update({
                                where: { id: connection.referrerId },
                                data: { walletBalance: { increment: payoutAmount } }
                            }),
                            prisma.walletTransaction.create({
                                data: { userId: connection.referrerId, amount: payoutAmount, type: "CREDIT", description: payoutDesc }
                            })
                        ]);
                        console.log(`[REFERRAL ALGO] Retailer ${session.user.id} triggered ₹${payoutAmount} to ${connection.referrerId}`);
                    } else {
                        await prisma.referralConnection.update({
                            where: { id: connection.id },
                            data: { activityCount: currentCount }
                        });
                    }
                }
            } catch (refError) {
                console.error("[REFERRAL ALGO ERROR]:", refError);
            }

            return NextResponse.json({
                success: true,
                message: "Order Accepted! You are responsible for delivering this order.",
                order: updatedOrder
            });

        } else {
            // CASE B: Retailer Accepts Fulfillment but DECLINES Delivery
            // We check if we should move to the next retailer or fallback
            const nextIndex = order.currentRetailerIndex + 1;
            
            if (order.nearestRetailerIds && nextIndex < order.nearestRetailerIds.length) {
                // Move to NEXT Retailer
                const nextRetailerId = order.nearestRetailerIds[nextIndex];
                
                const updatedOrder = await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        currentRetailerIndex: nextIndex,
                        assignedRetailerId: nextRetailerId,
                        declinedRetailers: { push: retailer.id } // Retailer declined delivery priority
                    }
                });

                // Send SMS to next retailer
                const nextRetailerProfile = await prisma.retailer.findUnique({
                    where: { id: nextRetailerId }
                });
                
                if (nextRetailerProfile && nextRetailerProfile.phone) {
                    await sendSMS(
                        nextRetailerProfile.phone,
                        `SWASTIK: New order #${orderId.slice(-6).toUpperCase()}! \n` +
                        `Fulfill & Deliver yourself to earn ₹${deliveryFee + selfBonus}?`
                    );
                }

                return NextResponse.json({
                    success: true,
                    message: "Order passed to next retailer for delivery priority.",
                    nextRetailer: nextRetailerId
                });

            } else {
                // FALLBACK: No retailer accepted delivery. Assign to first retailer for fulfillment, and platform agent for delivery.
                const firstRetailerId = order.nearestRetailerIds && order.nearestRetailerIds.length > 0 ? order.nearestRetailerIds[0] : retailer.id;
                const updatedOrder = await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        status: "Preparing", // Back to preparing
                        assignedRetailerId: firstRetailerId, // Back to original fulfiller
                        isRetailerDelivering: false,
                        declinedRetailers: { push: retailer.id }
                    }
                });

                // Dispatch Platform Rider
                assignOrderToNearestAgent(orderId).catch(err => {
                    console.error("Failed to execute Platform Rider Fallback:", err);
                });

                return NextResponse.json({
                    success: true,
                    message: "No retailers available for self-delivery. Platform agent assigned.",
                    order: updatedOrder
                });
            }
        }


    } catch (error) {
        console.error("Retailer Order Accept Error:", error);
        return NextResponse.json({ error: "Failed to accept order" }, { status: 500 });
    }
}


import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    try {
        const { testId } = await req.json();

        const booking = await prisma.labBooking.create({
            data: {
                patientId: session.user.id,
                testId,
                status: "Pending" // Will be Confirmed when paid/processed
            },
            include: {
                test: { include: { lab: true } }
            }
        });

        // --- MULTI-ROLE REFERRAL PAYOUT ENGINE (LAB) ---
        // Runs asynchronously to not block booking speed
        setTimeout(async () => {
            try {
                if (!booking.test?.lab?.userId) return;

                const connection = await prisma.referralConnection.findUnique({
                    where: { refereeId: booking.test.lab.userId }
                });

                if (connection && connection.status === "Active") {
                    const settings = await prisma.systemSettings.findFirst() || {};
                    const config = settings.referralConfig ? JSON.parse(settings.referralConfig) : {
                        lab: { onboardBonus: 1000, testPct: 5 } // Fallback
                    };
                    const lConfig = config.lab;

                    // Calculate Percentage Cut of Test Price
                    const payoutAmount = (booking.test.price * lConfig.testPct) / 100;

                    if (payoutAmount > 0) {
                        await prisma.$transaction([
                            prisma.referralConnection.update({
                                where: { id: connection.id },
                                data: {
                                    activityCount: { increment: 1 },
                                    totalEarned: { increment: payoutAmount }
                                }
                            }),
                            prisma.user.update({
                                where: { id: connection.referrerId },
                                data: { walletBalance: { increment: payoutAmount } }
                            }),
                            prisma.walletTransaction.create({
                                data: {
                                    userId: connection.referrerId,
                                    amount: payoutAmount,
                                    type: "CREDIT",
                                    description: `Recurring Commission: ${lConfig.testPct}% cut from Lab Test Booking`
                                }
                            })
                        ]);
                        console.log(`[REFERRAL ALGO] Lab ${booking.test.lab.userId} test booked, paid ₹${payoutAmount} to Partner ${connection.referrerId}`);
                    }
                }
            } catch (refErr) {
                console.error("[REFERRAL ALGO ERROR] Lab Booking hook failed:", refErr);
            }
        }, 0);

        return NextResponse.json({ success: true, booking });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

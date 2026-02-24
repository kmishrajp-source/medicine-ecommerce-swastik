import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { amount, paymentMethod, paymentDetails } = await req.json();

        if (!amount || amount < 100) {
            return NextResponse.json({ error: "Minimum withdrawal amount is ₹100" }, { status: 400 });
        }

        if (!paymentMethod || !paymentDetails) {
            return NextResponse.json({ error: "Payment method and details are required" }, { status: 400 });
        }

        // We use a transaction to guarantee atomicity and prevent double-spending
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: session.user.id },
                include: { deliveryAgent: true }
            });

            if (!user) {
                throw new Error("User not found");
            }

            const isDeliveryAgent = session.user.role === 'DELIVERY' && user.deliveryAgent;
            const availableBalance = user.walletBalance + (isDeliveryAgent ? user.deliveryAgent.walletBalance : 0);

            if (amount > availableBalance) {
                throw new Error("Insufficient wallet balance");
            }

            // Deduct from balances (Prioritize agent balance if they are an agent, else user balance)
            let remainingDeduction = amount;

            if (isDeliveryAgent && user.deliveryAgent.walletBalance > 0) {
                const deductFromAgent = Math.min(amount, user.deliveryAgent.walletBalance);
                await tx.deliveryAgent.update({
                    where: { id: user.deliveryAgent.id },
                    data: { walletBalance: { decrement: deductFromAgent } }
                });
                remainingDeduction -= deductFromAgent;
            }

            if (remainingDeduction > 0) {
                await tx.user.update({
                    where: { id: user.id },
                    data: { walletBalance: { decrement: remainingDeduction } }
                });
            }

            // Create the Withdrawal Request
            const withdrawal = await tx.withdrawal.create({
                data: {
                    userId: user.id,
                    amount: amount,
                    paymentMethod,
                    paymentDetails,
                    status: "Pending" // Needs admin approval to actually wire the money
                }
            });

            // Create a Ledger record
            await tx.walletTransaction.create({
                data: {
                    userId: user.id,
                    amount: amount,
                    type: "DEBIT",
                    description: `Withdrawal Request: ${paymentMethod}`
                }
            });

            return withdrawal;
        });

        return NextResponse.json({
            success: true,
            message: "Withdrawal request submitted successfully. It will be credited to your account after verification.",
            withdrawal: result
        });

    } catch (error) {
        console.error("Wallet Withdrawal Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process withdrawal" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/withdrawals - Get withdrawal history for logged-in user
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const withdrawals = await prisma.withdrawal.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' }
        });

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { walletBalance: true }
        });

        return NextResponse.json({ success: true, withdrawals, balance: user.walletBalance });
    } catch (error) {
        console.error("Fetch Withdrawals Error:", error);
        return NextResponse.json({ error: "Failed to fetch withdrawals" }, { status: 500 });
    }
}

// POST /api/withdrawals - Request a new withdrawal
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { amount, paymentMethod, paymentDetails } = await req.json();

        if (!amount || amount < 100) {
            return NextResponse.json({ error: "Minimum withdrawal amount is ₹100" }, { status: 400 });
        }
        if (!paymentMethod || !paymentDetails) {
            return NextResponse.json({ error: "Payment method and details are required" }, { status: 400 });
        }

        // Use transaction to prevent double spending
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: session.user.id } });
            
            if (user.walletBalance < amount) {
                throw new Error("Insufficient wallet balance");
            }

            // Deduct from wallet immediately
            await tx.user.update({
                where: { id: session.user.id },
                data: { walletBalance: { decrement: amount } }
            });

            // Log the deduction
            await tx.walletTransaction.create({
                data: {
                    userId: session.user.id,
                    amount: -amount,
                    type: "DEBIT",
                    description: `Withdrawal Request via ${paymentMethod}`
                }
            });

            // Create the pending withdrawal request for Admin to review
            const withdrawal = await tx.withdrawal.create({
                data: {
                    userId: session.user.id,
                    amount: amount,
                    status: "Pending", // Admin will approve and change to Completed
                    paymentMethod: paymentMethod, // e.g., "UPI", "Bank Transfer"
                    paymentDetails: paymentDetails // e.g., "user@ybl" or "{ accountNo: 123... }"
                }
            });

            return withdrawal;
        });

        return NextResponse.json({ success: true, withdrawal: result });
    } catch (error) {
        console.error("Withdrawal Request Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process withdrawal" }, { status: 500 });
    }
}

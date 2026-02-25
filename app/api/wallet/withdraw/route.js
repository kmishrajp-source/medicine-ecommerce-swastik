import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { amount, upiId } = await req.json();

        // Fetch the Global Minimum Withdrawal Config
        let settings = await prisma.systemSettings.findUnique({ where: { id: "default" } });
        const minWithdrawal = settings ? settings.minimumWithdrawal : 100.0;

        if (!amount || amount < minWithdrawal) {
            return NextResponse.json({ success: false, error: `Minimum withdrawal amount is ₹${minWithdrawal}.` }, { status: 400 });
        }

        if (!upiId || !upiId.includes('@')) {
            return NextResponse.json({ success: false, error: "Please enter a valid UPI ID." }, { status: 400 });
        }

        // Run as a Prisma Transaction to prevent race conditions during withdrawal
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: session.user.id },
                select: { walletBalance: true }
            });

            if (user.walletBalance < amount) {
                throw new Error("Insufficient wallet balance.");
            }

            // 1. Deduct the requested amount from the local wallet instantly
            const updatedUser = await tx.user.update({
                where: { id: session.user.id },
                data: { walletBalance: { decrement: amount } }
            });

            // 2. Log exactly why the money left
            await tx.walletTransaction.create({
                data: {
                    userId: session.user.id,
                    amount: amount,
                    type: "DEBIT",
                    description: `Withdrawal Request to UPI (${upiId})`
                }
            });

            // 3. Create the frozen status row for the Admin Panel
            const withdrawal = await tx.withdrawal.create({
                data: {
                    userId: session.user.id,
                    amount: amount,
                    status: "Pending",
                    paymentMethod: "UPI",
                    paymentDetails: upiId
                }
            });

            return { newBalance: updatedUser.walletBalance, withdrawal };
        });

        return NextResponse.json({
            success: true,
            message: "Withdrawal request submitted successfully. It will be credited within 24 hours.",
            data: result
        });

    } catch (error) {
        console.error("🟢 Withdrawal Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

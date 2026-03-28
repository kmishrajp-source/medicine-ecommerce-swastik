import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const { amount, paymentMethod, accountDetails } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        // Check user balance
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { walletBalance: true }
        });

        if (user.walletBalance < amount) {
            return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
        }

        // Create withdrawal request
        const withdrawal = await prisma.withdrawal.create({
            data: {
                userId: session.user.id,
                amount: parseFloat(amount),
                status: "PENDING",
                method: paymentMethod || "bank_transfer",
                accountDetails: JSON.stringify(accountDetails)
            }
        });

        // Debit wallet immediately (or hold it)
        // For this system, we'll debit and if rejected, we credit back.
        await prisma.user.update({
            where: { id: session.user.id },
            data: { walletBalance: { decrement: parseFloat(amount) } }
        });

        // Record transaction
        await prisma.walletTransaction.create({
            data: {
                userId: session.user.id,
                amount: -parseFloat(amount),
                type: "WITHDRAWAL",
                description: `Withdrawal request #${withdrawal.id}`
            }
        });

        return NextResponse.json({ success: true, withdrawal });

    } catch (error) {
        console.error("Withdrawal Request Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const withdrawals = await prisma.withdrawal.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, withdrawals });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}


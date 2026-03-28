import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const withdrawals = await prisma.withdrawal.findMany({
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, withdrawals });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const { id, status, adminNote } = await req.json();

        const withdrawal = await prisma.withdrawal.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!withdrawal) {
            return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
        }

        if (withdrawal.status !== "PENDING") {
            return NextResponse.json({ error: "Withdrawal already processed" }, { status: 400 });
        }

        if (status === "REJECTED") {
            // Refund the amount
            await prisma.user.update({
                where: { id: withdrawal.userId },
                data: { walletBalance: { increment: withdrawal.amount } }
            });

            await prisma.walletTransaction.create({
                data: {
                    userId: withdrawal.userId,
                    amount: withdrawal.amount,
                    type: "REFUND",
                    description: `Refund for rejected withdrawal #${withdrawal.id}`
                }
            });
        }

        const updatedWithdrawal = await prisma.withdrawal.update({
            where: { id },
            data: { 
                status, 
                adminNote,
                processedAt: status === "APPROVED" ? new Date() : null
            }
        });

        return NextResponse.json({ success: true, withdrawal: updatedWithdrawal });

    } catch (error) {
        console.error("Admin Withdrawal Update Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    try {
        const url = new URL(req.url);
        const statusFilter = url.searchParams.get("status") || "Pending";

        const withdrawals = await prisma.withdrawal.findMany({
            where: { status: statusFilter },
            include: {
                user: {
                    select: { name: true, email: true, phone: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(withdrawals);
    } catch (error) {
        console.error("Admin Withdrawals Error:", error);
        return NextResponse.json({ error: "Failed to fetch withdrawals" }, { status: 500 });
    }
}

export async function POST(req) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    try {
        const { withdrawalId, newStatus } = await req.json();

        if (!["Completed", "Rejected"].includes(newStatus)) {
            return NextResponse.json({ error: "Invalid status update" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const withdrawal = await tx.withdrawal.findUnique({
                where: { id: withdrawalId }
            });

            if (!withdrawal || withdrawal.status !== "Pending") {
                throw new Error("Withdrawal is not actionable.");
            }

            // If the Admin Rejects the withdrawal (e.g. invalid UPI), refund the user!
            if (newStatus === "Rejected") {
                await tx.user.update({
                    where: { id: withdrawal.userId },
                    data: { walletBalance: { increment: withdrawal.amount } }
                });

                await tx.walletTransaction.create({
                    data: {
                        userId: withdrawal.userId,
                        amount: withdrawal.amount,
                        type: "CREDIT",
                        description: `Refund: Withdrawal Rejected (${withdrawal.paymentDetails})`
                    }
                });
            }

            // Mark the withdrawal row as finalized
            const updated = await tx.withdrawal.update({
                where: { id: withdrawalId },
                data: { status: newStatus }
            });

            return updated;
        });

        return NextResponse.json({ success: true, withdrawal: result });
    } catch (error) {
        console.error("Admin Withdrawal Update Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

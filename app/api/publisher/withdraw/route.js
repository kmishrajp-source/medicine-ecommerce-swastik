import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount } = await req.json();

        if (amount < 500) {
            return NextResponse.json({ error: "Minimum withdrawal is ₹500" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { publisher: true }
        });

        if (!user || !user.publisher) {
            return NextResponse.json({ error: "Publisher account not found" }, { status: 404 });
        }

        if (user.walletBalance < amount) {
            return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
        }

        // Create Withdrawal and Transaction
        const [withdrawal, userUpdate] = await prisma.$transaction([
            prisma.publisherWithdrawal.create({
                data: {
                    publisherId: user.publisher.id,
                    amount: parseFloat(amount),
                    status: "pending"
                }
            }),
            prisma.user.update({
                where: { id: user.id },
                data: {
                    walletBalance: { decrement: parseFloat(amount) },
                    transactions: {
                        create: {
                            amount: parseFloat(amount),
                            type: "DEBIT",
                            description: `Withdrawal request #${amount}`
                        }
                    }
                }
            })
        ]);

        return NextResponse.json({ success: true, withdrawal, balance: userUpdate.walletBalance });

    } catch (error) {
        console.error("Withdrawal Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

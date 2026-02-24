import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                walletBalance: true,
                referralCode: true,
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 20 // Get last 20 transactions
                },
                withdrawals: {
                    orderBy: { createdAt: 'desc' },
                    take: 5 // Get last 5 withdrawals
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // For Delivery Agents, their balance is stored in the DeliveryAgent table, 
        // we'll fetch both and combine them for a unified wallet UI if applicable, 
        // but to keep it simple, let's aggregate them.
        let agentBalance = 0;
        if (session.user.role === 'DELIVERY') {
            const agent = await prisma.deliveryAgent.findUnique({
                where: { userId: session.user.id },
                select: { walletBalance: true }
            });
            if (agent) {
                agentBalance = agent.walletBalance;
            }
        }

        return NextResponse.json({
            success: true,
            wallet: {
                balance: user.walletBalance + agentBalance, // Combined balance
                referralCode: user.referralCode,
                transactions: user.transactions,
                withdrawals: user.withdrawals
            }
        });

    } catch (error) {
        console.error("Wallet Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch wallet data" }, { status: 500 });
    }
}

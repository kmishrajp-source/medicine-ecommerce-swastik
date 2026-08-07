import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const riderId = session.user.id;
        const body = await req.json();
        const { amount, bankName, bankRef, receiptUrl, note } = body;

        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount <= 0) {
            return NextResponse.json({ error: "Invalid deposit amount" }, { status: 400 });
        }

        let account = await prisma.riderCashAccount.findUnique({ where: { riderId } });
        if (!account) {
            account = await prisma.riderCashAccount.create({
                data: { riderId, cashHeld: 0, cashSlab: 5000 }
            });
        }

        if (numAmount > account.cashHeld && account.cashHeld > 0) {
            // Allow deposit up to cashHeld or slightly more if desired, but give warning
        }

        const deposit = await prisma.cashDeposit.create({
            data: {
                accountId: account.id,
                amount: numAmount,
                bankName: bankName || 'Bank Transfer',
                bankRef: bankRef || null,
                receiptUrl: receiptUrl || null,
                note: note || null,
                depositedAt: new Date(),
                status: 'PENDING'
            }
        });

        return NextResponse.json({
            success: true,
            message: "Deposit request submitted successfully! Pending admin verification.",
            deposit
        });

    } catch (error) {
        console.error("Rider Deposit POST Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

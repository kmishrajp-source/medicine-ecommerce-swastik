import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const riderId = session.user.id;

        let account = await prisma.riderCashAccount.findUnique({
            where: { riderId },
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 30
                },
                deposits: {
                    orderBy: { createdAt: 'desc' },
                    take: 30
                }
            }
        });

        if (!account) {
            account = await prisma.riderCashAccount.create({
                data: { riderId, cashHeld: 0, cashSlab: 5000 },
                include: {
                    transactions: true,
                    deposits: true
                }
            });
        }

        const isOverLimit = account.cashHeld > account.cashSlab;

        return NextResponse.json({
            success: true,
            account: {
                ...account,
                isOverLimit,
                availableMargin: Math.max(0, account.cashSlab - account.cashHeld)
            }
        });

    } catch (error) {
        console.error("Rider Cash GET Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

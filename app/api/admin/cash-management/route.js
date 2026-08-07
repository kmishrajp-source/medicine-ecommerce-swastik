import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Access Denied" }, { status: 403 });
        }

        // Get all riders / delivery agents
        const riders = await prisma.user.findMany({
            where: {
                OR: [
                    { role: 'DELIVERY_AGENT' },
                    { deliveryAgent: { isNot: null } },
                    { riderCashAccount: { isNot: null } }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                deliveryAgent: {
                    select: {
                        id: true,
                        phone: true,
                        vehicleNumber: true,
                        isOnline: true
                    }
                },
                riderCashAccount: {
                    include: {
                        deposits: {
                            where: { status: 'PENDING' },
                            orderBy: { createdAt: 'desc' }
                        },
                        transactions: {
                            orderBy: { createdAt: 'desc' },
                            take: 5
                        }
                    }
                }
            }
        });

        // Format data and calculate status
        const riderAccounts = [];
        let totalCashInField = 0;
        let overLimitCount = 0;
        let pendingDepositsCount = 0;
        let totalDeposited = 0;

        for (const rider of riders) {
            let account = rider.riderCashAccount;

            // Auto-provision cash account if not existing
            if (!account) {
                account = await prisma.riderCashAccount.create({
                    data: {
                        riderId: rider.id,
                        cashHeld: 0.0,
                        cashSlab: 5000.0,
                        totalCollected: 0.0,
                        totalDeposited: 0.0
                    },
                    include: {
                        deposits: { where: { status: 'PENDING' } },
                        transactions: { orderBy: { createdAt: 'desc' }, take: 5 }
                    }
                });
            }

            const isOverLimit = account.cashHeld > account.cashSlab;
            if (isOverLimit) overLimitCount++;
            totalCashInField += account.cashHeld;
            totalDeposited += account.totalDeposited;
            pendingDepositsCount += account.deposits.length;

            riderAccounts.push({
                riderId: rider.id,
                name: rider.name || 'Delivery Rider',
                email: rider.email,
                phone: rider.deliveryAgent?.phone || 'N/A',
                vehicleNumber: rider.deliveryAgent?.vehicleNumber || 'N/A',
                isOnline: rider.deliveryAgent?.isOnline ?? false,
                accountId: account.id,
                cashHeld: account.cashHeld,
                cashSlab: account.cashSlab,
                totalCollected: account.totalCollected,
                totalDeposited: account.totalDeposited,
                isOverLimit,
                isActive: account.isActive,
                pendingDeposits: account.deposits,
                recentTransactions: account.transactions
            });
        }

        // Also fetch overall pending deposits for quick admin action queue
        const pendingDeposits = await prisma.cashDeposit.findMany({
            where: { status: 'PENDING' },
            include: {
                account: {
                    include: {
                        rider: { select: { id: true, name: true, email: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            summary: {
                totalCashInField: parseFloat(totalCashInField.toFixed(2)),
                overLimitCount,
                pendingDepositsCount: pendingDeposits.length,
                totalDeposited: parseFloat(totalDeposited.toFixed(2)),
                totalRiders: riderAccounts.length
            },
            riders: riderAccounts,
            pendingDeposits
        });

    } catch (error) {
        console.error("Admin Cash Management GET Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

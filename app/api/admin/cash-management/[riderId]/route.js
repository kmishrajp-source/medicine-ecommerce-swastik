import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET rider details and full transaction / deposit history
export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Access Denied" }, { status: 403 });
        }

        const { riderId } = await params;

        let account = await prisma.riderCashAccount.findUnique({
            where: { riderId },
            include: {
                rider: {
                    select: { id: true, name: true, email: true, role: true }
                },
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 100
                },
                deposits: {
                    orderBy: { createdAt: 'desc' },
                    take: 50
                }
            }
        });

        if (!account) {
            // Auto-provision
            const rider = await prisma.user.findUnique({ where: { id: riderId } });
            if (!rider) {
                return NextResponse.json({ error: "Rider not found" }, { status: 404 });
            }

            account = await prisma.riderCashAccount.create({
                data: { riderId, cashHeld: 0, cashSlab: 5000 },
                include: {
                    rider: { select: { id: true, name: true, email: true, role: true } },
                    transactions: true,
                    deposits: true
                }
            });
        }

        return NextResponse.json({ success: true, account });

    } catch (error) {
        console.error("Admin Rider Cash GET Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PATCH update rider slab, status, or manual balance adjustment
export async function PATCH(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Access Denied" }, { status: 403 });
        }

        const { riderId } = await params;
        const body = await req.json();
        const { cashSlab, isActive, adjustmentAmount, adjustmentNote } = body;

        let account = await prisma.riderCashAccount.findUnique({ where: { riderId } });
        if (!account) {
            account = await prisma.riderCashAccount.create({
                data: { riderId, cashHeld: 0, cashSlab: cashSlab || 5000 }
            });
        }

        const updateData = {};
        if (typeof cashSlab === 'number' && cashSlab >= 0) {
            updateData.cashSlab = cashSlab;
        }
        if (typeof isActive === 'boolean') {
            updateData.isActive = isActive;
        }

        // If manual cash adjustment requested
        if (typeof adjustmentAmount === 'number' && adjustmentAmount !== 0) {
            const newHeld = Math.max(0, account.cashHeld + adjustmentAmount);
            updateData.cashHeld = newHeld;

            // Log transaction
            await prisma.cashTransaction.create({
                data: {
                    accountId: account.id,
                    type: 'ADJUSTMENT',
                    amount: adjustmentAmount,
                    note: adjustmentNote || `Admin manual adjustment by ${session.user.name || session.user.email}`
                }
            });
        }

        const updatedAccount = await prisma.riderCashAccount.update({
            where: { id: account.id },
            data: updateData,
            include: {
                rider: { select: { id: true, name: true, email: true } },
                transactions: { orderBy: { createdAt: 'desc' }, take: 10 }
            }
        });

        return NextResponse.json({ success: true, account: updatedAccount });

    } catch (error) {
        console.error("Admin Rider Cash PATCH Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

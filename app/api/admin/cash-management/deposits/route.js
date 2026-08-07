import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendWhatsAppNotification } from '@/lib/whatsapp';

// GET list of cash deposits with optional status filter
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Access Denied" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') || 'PENDING';

        const deposits = await prisma.cashDeposit.findMany({
            where: status === 'ALL' ? {} : { status },
            include: {
                account: {
                    include: {
                        rider: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, deposits });

    } catch (error) {
        console.error("Admin Deposits GET Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PATCH confirm or reject deposit -> automatically reconciles rider cash balance
export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Access Denied" }, { status: 403 });
        }

        const body = await req.json();
        const { depositId, action, rejectedReason } = body; // action = 'CONFIRM' | 'REJECT'

        if (!depositId || !['CONFIRM', 'REJECT'].includes(action)) {
            return NextResponse.json({ error: "Invalid action or depositId" }, { status: 400 });
        }

        const deposit = await prisma.cashDeposit.findUnique({
            where: { id: depositId },
            include: {
                account: {
                    include: {
                        rider: { select: { id: true, name: true, email: true, phone: true } }
                    }
                }
            }
        });

        if (!deposit) {
            return NextResponse.json({ error: "Deposit request not found" }, { status: 404 });
        }

        if (deposit.status !== 'PENDING') {
            return NextResponse.json({ error: `Deposit is already ${deposit.status}` }, { status: 400 });
        }

        const account = deposit.account;

        if (action === 'CONFIRM') {
            // Reconcile: Deduct from cashHeld, add to totalDeposited
            const newCashHeld = Math.max(0, account.cashHeld - deposit.amount);
            const newTotalDeposited = account.totalDeposited + deposit.amount;

            // 1. Update deposit status
            const updatedDeposit = await prisma.cashDeposit.update({
                where: { id: depositId },
                data: {
                    status: 'CONFIRMED',
                    confirmedAt: new Date(),
                    confirmedBy: session.user.id
                }
            });

            // 2. Update rider cash account
            await prisma.riderCashAccount.update({
                where: { id: account.id },
                data: {
                    cashHeld: newCashHeld,
                    totalDeposited: newTotalDeposited
                }
            });

            // 3. Log immutable cash transaction
            await prisma.cashTransaction.create({
                data: {
                    accountId: account.id,
                    type: 'DEPOSIT',
                    amount: deposit.amount,
                    note: `Bank Deposit Confirmed by Admin (${deposit.bankRef || 'No Ref'}). Reconciled.`
                }
            });

            // 4. Send WhatsApp Notification to rider
            if (deposit.account.rider?.phone) {
                try {
                    await sendWhatsAppNotification(
                        deposit.account.rider.phone,
                        `✅ CASH DEPOSIT RECONCILED\n\nYour bank deposit of ₹${deposit.amount.toLocaleString()} (Ref: ${deposit.bankRef || 'N/A'}) has been confirmed by Admin.\n\nRemaining Cash Held: ₹${newCashHeld.toLocaleString()}\nLimit: ₹${account.cashSlab.toLocaleString()}`
                    );
                } catch (e) {
                    console.warn("WhatsApp notification error:", e.message);
                }
            }

            return NextResponse.json({
                success: true,
                message: `Deposit of ₹${deposit.amount} confirmed and reconciled!`,
                deposit: updatedDeposit
            });

        } else {
            // REJECT
            const updatedDeposit = await prisma.cashDeposit.update({
                where: { id: depositId },
                data: {
                    status: 'REJECTED',
                    rejectedReason: rejectedReason || 'Proof/details invalid',
                    confirmedAt: new Date(),
                    confirmedBy: session.user.id
                }
            });

            if (deposit.account.rider?.phone) {
                try {
                    await sendWhatsAppNotification(
                        deposit.account.rider.phone,
                        `❌ CASH DEPOSIT REJECTED\n\nYour bank deposit request of ₹${deposit.amount.toLocaleString()} was rejected by Admin.\nReason: ${rejectedReason || 'Verification failed'}.\nPlease resubmit with valid reference/receipt.`
                    );
                } catch (e) {
                    console.warn("WhatsApp notification error:", e.message);
                }
            }

            return NextResponse.json({
                success: true,
                message: `Deposit of ₹${deposit.amount} marked as rejected.`,
                deposit: updatedDeposit
            });
        }

    } catch (error) {
        console.error("Admin Deposits PATCH Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

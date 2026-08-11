import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { WhatsAppTriggers } from '@/lib/whatsapp';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'RETAILER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const retailer = await prisma.retailer.findFirst({
            where: { userId: session.user.id },
            include: {
                agreements: {
                    orderBy: { acceptedAt: 'desc' },
                    take: 1
                }
            }
        });

        if (!retailer) {
            return NextResponse.json({ error: "Retailer not found" }, { status: 404 });
        }

        // 1. Calculate Risk Profile
        // A simple risk engine based on COD un-reconciled vs total orders
        const recentOrders = await prisma.order.findMany({
            where: { assignedRetailerId: retailer.id },
            select: { paymentMethod: true, status: true, codReconciled: true, total: true },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        let unremittedCOD = 0;
        let completedDeliveries = 0;

        recentOrders.forEach(o => {
            if (o.status === 'Delivered') completedDeliveries++;
            if (o.paymentMethod === 'COD' && o.status === 'Delivered' && !o.codReconciled) {
                unremittedCOD += o.total;
            }
        });

        // Risk Engine Logic
        let riskLevel = 'LOW';
        let riskReason = 'Standard operating conditions';

        if (!retailer.bankVerified) {
            riskLevel = 'HIGH';
            riskReason = 'Bank account is unverified. Payouts are paused.';
        } else if (unremittedCOD > 5000) {
            riskLevel = 'HIGH';
            riskReason = 'High unremitted COD balance. Please deposit cash to platform.';
        } else if (unremittedCOD > 2000) {
            riskLevel = 'MEDIUM';
            riskReason = 'Moderate unremitted COD balance. Deposit recommended.';
        }

        // Fire WhatsApp alert for MEDIUM/HIGH risk (non-blocking)
        if (riskLevel !== 'LOW') {
            try {
                const userRecord = await prisma.user.findUnique({
                    where: { id: session.user.id },
                    select: { phone: true }
                });
                if (userRecord?.phone) {
                    WhatsAppTriggers.codRiskAlert(
                        userRecord.phone,
                        retailer.shopName || 'Partner',
                        unremittedCOD.toFixed(2)
                    );
                }
            } catch (notifyErr) {
                console.error('WhatsApp COD risk notify error:', notifyErr.message);
            }
        }

        const hasAcceptedAgreement = retailer.agreements && retailer.agreements.length > 0;

        return NextResponse.json({
            success: true,
            trust: {
                verification: retailer.verified ? 'VERIFIED' : 'PENDING',
                bankVerified: retailer.bankVerified,
                riskLevel,
                riskReason,
                hasAcceptedAgreement,
                unremittedCOD,
                completedDeliveries
            }
        });

    } catch (error) {
        console.error('Retailer Trust fetch error:', error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    // Used to accept the retailer agreement
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'RETAILER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { version, ipAddress } = await req.json();

        const retailer = await prisma.retailer.findFirst({
            where: { userId: session.user.id }
        });

        if (!retailer) {
            return NextResponse.json({ error: "Retailer not found" }, { status: 404 });
        }

        const agreement = await prisma.retailerAgreement.create({
            data: {
                retailerId: retailer.id,
                version: version || '1.0',
                ipAddress: ipAddress || '0.0.0.0',
                documentHash: 'auto-accepted-via-dashboard'
            }
        });

        // Audit Log
        await prisma.systemLog.create({
            data: {
                userId: session.user.id,
                action: "RETAILER_AGREEMENT_ACCEPTED",
                details: `Retailer ${retailer.id} accepted agreement version ${version}.`,
                level: "INFO"
            }
        });

        return NextResponse.json({ success: true, agreement });
    } catch (error) {
        console.error('Retailer Agreement POST error:', error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== 'INSURANCE' && session.user.role !== 'ADMIN')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const insurance = await prisma.insuranceProvider.findUnique({
            where: { userId: session.user.id }
        });

        if (!insurance) {
            return NextResponse.json({ error: "Insurance profile not found" }, { status: 404 });
        }

        // Fetch Claims
        const claims = await prisma.insuranceClaim.findMany({
            where: { insuranceId: insurance.id },
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        // Calculate Stats (Simulation)
        const totalClaims = await prisma.insuranceClaim.count({ where: { insuranceId: insurance.id } });
        const pendingClaims = await prisma.insuranceClaim.count({ 
            where: { insuranceId: insurance.id, status: 'PENDING' } 
        });
        const approvedClaims = await prisma.insuranceClaim.count({ 
            where: { insuranceId: insurance.id, status: 'APPROVED' } 
        });

        // Revenue: handlingFee per approved claim
        const totalFees = approvedClaims * insurance.handlingFee;

        return NextResponse.json({
            success: true,
            stats: {
                totalClaims,
                pendingClaims,
                approvedClaims,
                totalFees,
                handlingFee: insurance.handlingFee
            },
            claims
        });

    } catch (error) {
        console.error("Insurance Dashboard API Error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
    }
}

// POST for Claim Verification / Status Update
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'INSURANCE') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { claimId, status, remarks } = await req.json();

        const updatedClaim = await prisma.insuranceClaim.update({
            where: { id: claimId },
            data: { status }
        });

        // Log System Health for Monitoring
        await prisma.systemHealthLog.create({
            data: {
                component: "INSURANCE_PORTAL",
                issueType: "CLAIM_PROCESSING",
                severity: "INFO",
                message: `Claim ${claimId} updated to ${status} by ${session.user.name}`,
                details: { claimId, status, remarks }
            }
        });

        return NextResponse.json({ success: true, updatedClaim });
    } catch (error) {
        console.error("Claim Status Update Error:", error);
        return NextResponse.json({ error: "Failed to update claim" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { subOrderId, adjustmentAmount, reason, action } = await req.json();

        if (!subOrderId || adjustmentAmount === undefined || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const settlementItem = await prisma.settlementItem.findUnique({
            where: { subOrderId: subOrderId }
        });

        if (!settlementItem) {
            return NextResponse.json({ error: "Settlement ledger entry not found for this order" }, { status: 404 });
        }

        if (settlementItem.status === 'PAID') {
            return NextResponse.json({ error: "Cannot adjust a settlement that has already been PAID. Please use a separate offline adjustment." }, { status: 400 });
        }

        // Apply adjustment
        let newGross = settlementItem.grossAmount;
        let newNet = settlementItem.netAmount;
        const amount = parseFloat(adjustmentAmount);

        if (action === 'REFUND') {
            // A refund reduces the gross and net. The commission might also need adjusting, 
            // but for simplicity we'll just reduce the net amount the retailer receives.
            newNet = newNet - amount;
        } else if (action === 'ADD') {
            newNet = newNet + amount;
        }

        const updatedSettlement = await prisma.settlementItem.update({
            where: { id: settlementItem.id },
            data: {
                netAmount: newNet >= 0 ? newNet : 0,
                status: action === 'CANCEL' ? 'ON_HOLD' : settlementItem.status
            }
        });

        // Audit Log
        await prisma.systemLog.create({
            data: {
                userId: session.user.id,
                action: "SETTLEMENT_ADJUSTMENT",
                details: `Adjusted subOrder ${subOrderId} by ${action} ${amount}. Reason: ${reason}. New Net: ${newNet}`,
                level: "INFO"
            }
        });

        return NextResponse.json({ success: true, settlement: updatedSettlement });

    } catch (error) {
        console.error("Settlement Adjustment Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

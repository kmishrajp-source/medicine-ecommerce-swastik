import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    
    // Security Check: Only ADMIN can access logs
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const logs = await prisma.systemFailureLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        // Simple AI logic simulation: Add suggestions to logs that don't have them
        const logsWithAISuggestions = logs.map(log => {
            if (!log.aiSuggestion) {
                let suggestion = "Review server logs for detailed stack trace.";
                if (log.actionType === 'payment_verification') {
                    suggestion = "Check Razorpay dashboard for payment ID mismatch.";
                } else if (log.actionType === 'checkout') {
                    suggestion = "Verify if inventory stock was locked during transaction.";
                } else if (log.actionType === 'registration') {
                    if (log.userRole === 'hospital') suggestion = "Verify Hospital license format or duplicate hospital name.";
                    else if (log.userRole === 'insurance') suggestion = "Check IRDAI ID validity and corporate email domain.";
                    else if (log.userRole === 'manufacturer') suggestion = "Verify GMP certification status and supply license.";
                    else suggestion = "Check for duplicate email or invalid phone format.";
                } else if (log.actionType === 'stock_upload') {
                    suggestion = "Check CSV column headers (name, price, stock) and image URL formats.";
                } else if (log.actionType === 'payment_settlement') {
                    suggestion = "Check partner bank/UPI connectivity or wallet balance initialization.";
                }
                return { ...log, aiSuggestion: suggestion };
            }
            return log;
        });

        return NextResponse.json({ success: true, logs: logsWithAISuggestions });
    } catch (error) {
        console.error("Failed to fetch system logs:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}


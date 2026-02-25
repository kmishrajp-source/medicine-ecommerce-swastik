import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const settings = await prisma.systemSettings.findUnique({
            where: { id: "default" },
            // ONLY select harmless public-facing metrics
            select: {
                minimumWithdrawal: true,
                welcomeBonusAmount: true,
                referralBonusAmount: true
            }
        });

        if (!settings) {
            // Return the Schema Default if not found
            return NextResponse.json({
                minimumWithdrawal: 100.0,
                welcomeBonusAmount: 50.0,
                referralBonusAmount: 50.0
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error("Public Settings Fetch Error:", error);
        // Fallback safety to hardcoded Schema defaults
        return NextResponse.json({
            minimumWithdrawal: 100.0,
            welcomeBonusAmount: 50.0,
            referralBonusAmount: 50.0
        });
    }
}

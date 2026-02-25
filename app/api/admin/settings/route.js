import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET current settings
export async function GET(req) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    try {
        let settings = await prisma.systemSettings.findUnique({
            where: { id: "default" }
        });

        // Fail-safe generation
        if (!settings) {
            settings = await prisma.systemSettings.create({
                data: { id: "default" }
            });
        }

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error("Admin Settings Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

// UPDATE settings
export async function POST(req) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    try {
        const { welcomeBonusAmount, referralBonusAmount, minimumWithdrawal, deliveryAgentFee } = await req.json();

        const updatedSettings = await prisma.systemSettings.upsert({
            where: { id: "default" },
            update: {
                welcomeBonusAmount: Number(welcomeBonusAmount),
                referralBonusAmount: Number(referralBonusAmount),
                minimumWithdrawal: Number(minimumWithdrawal),
                deliveryAgentFee: Number(deliveryAgentFee)
            },
            create: {
                id: "default",
                welcomeBonusAmount: Number(welcomeBonusAmount),
                referralBonusAmount: Number(referralBonusAmount),
                minimumWithdrawal: Number(minimumWithdrawal),
                deliveryAgentFee: Number(deliveryAgentFee)
            }
        });

        return NextResponse.json({ success: true, message: "Settings updated successfully!", settings: updatedSettings });
    } catch (error) {
        console.error("Admin Settings Update Error:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}

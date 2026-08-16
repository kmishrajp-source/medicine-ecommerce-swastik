import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRiderReferralCode } from "@/lib/rider-referral";
import prisma from "@/lib/prisma";

// GET /api/refer/rider — Generate or fetch referral code for authenticated user
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // First check if they are a rider
        const rider = await prisma.deliveryAgent.findUnique({ where: { userId: session.user.id } });
        if (rider) {
            const code = await getRiderReferralCode(rider.id);
            return NextResponse.json({ code });
        }

        // If not a rider, they are a customer — check if they have a User referral code
        let user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user.referralCode) {
            const shortId = session.user.id.slice(-5).toUpperCase();
            const code = `SWA${shortId}`;
            user = await prisma.user.update({
                where: { id: session.user.id },
                data: { referralCode: code }
            });
        }

        return NextResponse.json({ code: user.referralCode });
    } catch (err) {
        console.error("[REFER RIDER]", err);
        return NextResponse.json({ error: "Failed to fetch referral code" }, { status: 500 });
    }
}

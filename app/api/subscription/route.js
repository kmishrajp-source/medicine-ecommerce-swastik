import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { medicineName, quantity, frequency } = await req.json();

    try {
        // Calculate next delivery date (e.g., 30 days from now)
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + (frequency === 'Weekly' ? 7 : 30));

        await prisma.subscription.create({
            data: {
                userId: session.user.id,
                medicineName,
                quantity: parseInt(quantity),
                frequency,
                nextDate,
                status: 'Active'
            }
        });
        return NextResponse.json({ success: true, message: "Subscription started!" });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        let subscriptions;
        // If admin, fetch all. If user, fetch own.
        // For now, let's just implement User fetch here. 
        // Admin fetch will be in a separate block or check role.
        if (session.user.role === 'ADMIN') {
            subscriptions = await prisma.subscription.findMany({
                include: { user: true },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            subscriptions = await prisma.subscription.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: 'desc' }
            });
        }

        return NextResponse.json({ success: true, subscriptions });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

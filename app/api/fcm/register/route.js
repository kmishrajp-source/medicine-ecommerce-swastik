import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ error: "FCM Token is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { fcmTokens: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Only add token if it doesn't already exist for this user
        if (!user.fcmTokens.includes(token)) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    fcmTokens: {
                        push: token
                    }
                }
            });
            console.log(`[FCM] Registered new device token for User ${session.user.email}`);
        }

        return NextResponse.json({ success: true, message: "Device registered for push notifications." });

    } catch (error) {
        console.error("FCM Token Registration Error:", error);
        return NextResponse.json({ error: "Failed to register device" }, { status: 500 });
    }
}

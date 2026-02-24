import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "DELIVERY") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const agent = await prisma.deliveryAgent.findUnique({
            where: { userId: session.user.id }
        });

        if (!agent) return NextResponse.json({ error: "Agent profile not found" }, { status: 404 });

        return NextResponse.json({ success: true, agent });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "DELIVERY") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { isOnline, lat, lng } = await req.json();

        const updateData = {};
        if (typeof isOnline === 'boolean') updateData.isOnline = isOnline;
        if (lat && lng) {
            updateData.lat = parseFloat(lat);
            updateData.lng = parseFloat(lng);
        }

        const agent = await prisma.deliveryAgent.update({
            where: { userId: session.user.id },
            data: updateData
        });

        return NextResponse.json({ success: true, agent });
    } catch (error) {
        console.error("Agent Status Update Error:", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}

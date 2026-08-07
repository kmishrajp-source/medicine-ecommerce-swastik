import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        const { imageUrl, competitorName, phone } = await req.json();

        if (!imageUrl || !competitorName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const bill = await prisma.competitorBill.create({
            data: {
                userId: session?.user?.id || null,
                phone: phone || null,
                imageUrl,
                competitorName,
                status: "PENDING"
            }
        });

        return NextResponse.json({ success: true, bill });

    } catch (error) {
        console.error("Error creating competitor bill:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

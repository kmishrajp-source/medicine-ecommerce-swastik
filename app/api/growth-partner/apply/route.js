import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized. Please create a basic account first." }, { status: 401 });
    }

    try {
        const { name, company, region, phone } = await req.json();

        // Check if already an MR
        const existing = await prisma.medicalRep.findUnique({
            where: { userId: session.user.id }
        });

        if (existing) {
            return NextResponse.json({ error: "You have already applied to be a Growth Partner." }, { status: 400 });
        }

        const rep = await prisma.medicalRep.create({
            data: {
                userId: session.user.id,
                name,
                company,
                region,
                phone,
                status: "Pending", // Requires Admin Approval
                verified: false
            }
        });

        return NextResponse.json({
            success: true,
            message: "Application submitted! Our team will review your profile shortly.",
            rep
        });

    } catch (error) {
        console.error("MR Approval Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

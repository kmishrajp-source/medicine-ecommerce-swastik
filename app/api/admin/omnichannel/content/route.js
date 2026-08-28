import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const content = await prisma.omnichannelContent.findMany({
            orderBy: { updatedAt: 'desc' }
        });
        return NextResponse.json({ success: true, content });
    } catch (error) {
        console.error("Omnichannel GET Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();

        // Default to DRAFT to enforce Human Approval Workflow (Phase 16)
        const newContent = await prisma.omnichannelContent.create({
            data: {
                title: data.title,
                category: data.category,
                contentType: data.contentType || "GENERAL",
                websiteBody: data.websiteBody,
                facebookBody: data.facebookBody,
                instagramBody: data.instagramBody,
                whatsappBody: data.whatsappBody,
                emailBody: data.emailBody,
                status: "DRAFT",
                authorId: session.user.id
            }
        });

        return NextResponse.json({ success: true, content: newContent });
    } catch (error) {
        console.error("Omnichannel POST Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

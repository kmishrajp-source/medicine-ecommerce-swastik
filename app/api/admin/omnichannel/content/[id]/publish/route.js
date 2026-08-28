import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { dispatchToViaSocket } from "@/lib/viasocket";

export async function POST(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = params;

        // Fetch the content
        const content = await prisma.omnichannelContent.findUnique({
            where: { id }
        });

        if (!content) {
            return NextResponse.json({ success: false, error: "Content not found" }, { status: 404 });
        }

        if (content.status === "PUBLISHED") {
            return NextResponse.json({ success: false, error: "Already published" }, { status: 400 });
        }

        // Dispatch payload to viaSocket Publishing Webhook
        const payload = {
            contentId: content.id,
            title: content.title,
            category: content.category,
            contentType: content.contentType,
            versions: {
                facebook: content.facebookBody,
                instagram: content.instagramBody,
                whatsapp: content.whatsappBody,
                email: content.emailBody
            }
        };

        const viaSocketResult = await dispatchToViaSocket(
            "publish_omnichannel_content", 
            payload, 
            process.env.VIASOCKET_PUBLISHING_WEBHOOK_URL
        );

        if (!viaSocketResult.success) {
             // We return a 500 error if viaSocket fails so the UI doesn't mark it as published
             return NextResponse.json({ success: false, error: "viaSocket dispatch failed: " + viaSocketResult.error }, { status: 500 });
        }

        // Update database status
        const updatedContent = await prisma.omnichannelContent.update({
            where: { id },
            data: { 
                status: "PUBLISHED",
                publishDate: new Date()
            }
        });

        return NextResponse.json({ success: true, content: updatedContent });
    } catch (error) {
        console.error("Omnichannel Publish Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

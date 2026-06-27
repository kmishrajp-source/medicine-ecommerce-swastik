import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ACTIONS, hasPermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { sendCriticalAlert } from "@/lib/notifications";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(req.url);
        const chapter = url.searchParams.get("chapter");

        let docs;
        if (chapter) {
            docs = await prisma.sopDocument.findMany({
                where: { chapter },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            // Get latest active for each chapter
            docs = await prisma.sopDocument.findMany({
                where: { isActive: true },
                orderBy: { chapter: 'asc' }
            });
        }

        return NextResponse.json({ success: true, docs });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (!hasPermission(session.user.role, ACTIONS.MANAGE_SOPS)) {
            return NextResponse.json({ error: "Forbidden: Cannot manage SOPs" }, { status: 403 });
        }

        const body = await req.json();
        const { chapter, version, title, content } = body;

        // Mark older versions as inactive
        await prisma.sopDocument.updateMany({
            where: { chapter, isActive: true },
            data: { isActive: false }
        });

        // Create new version
        const doc = await prisma.sopDocument.create({
            data: {
                chapter,
                version,
                title,
                content,
                authorId: session.user.id,
                isActive: true
            }
        });

        await logAudit({
            userId: session.user.id,
            action: "CREATED_SOP_VERSION",
            entityType: "SopDocument",
            entityId: doc.id,
            newValue: `Version ${version}`
        });

        await sendCriticalAlert({
            type: "SOP_CHANGED",
            message: `SOP Chapter ${chapter} updated to Version ${version} by ${session.user.name}.`,
            userId: session.user.id
        });

        return NextResponse.json({ success: true, doc });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

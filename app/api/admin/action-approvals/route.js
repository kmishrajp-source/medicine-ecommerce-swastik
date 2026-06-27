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

        // Is user a Super Admin?
        const isSuperAdmin = hasPermission(session.user.role, ACTIONS.MANAGE_PERMISSIONS);
        
        let requests;
        if (isSuperAdmin) {
            requests = await prisma.approvalRequest.findMany({
                orderBy: { createdAt: 'desc' }
            });
        } else {
            requests = await prisma.approvalRequest.findMany({
                where: { requestedById: session.user.id },
                orderBy: { createdAt: 'desc' }
            });
        }

        return NextResponse.json({ success: true, requests });
    } catch (error) {
        console.error("GET Action Approvals error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { actionType, details } = body;

        const request = await prisma.approvalRequest.create({
            data: {
                requestedById: session.user.id,
                actionType,
                details: typeof details === 'string' ? details : JSON.stringify(details),
                status: "PENDING"
            }
        });

        await sendCriticalAlert({
            type: "ACTION_APPROVAL_REQUESTED",
            message: `User ${session.user.name || session.user.email} requested approval for ${actionType}.`,
            userId: session.user.id
        });

        await logAudit({
            userId: session.user.id,
            action: "REQUESTED_APPROVAL",
            entityType: "ApprovalRequest",
            entityId: request.id,
            newValue: details
        });

        return NextResponse.json({ success: true, request });
    } catch (error) {
        console.error("POST Action Approvals error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Only Super Admin (or someone with MANAGE_SETTINGS) can approve
        if (!hasPermission(session.user.role, ACTIONS.MANAGE_SETTINGS)) {
            return NextResponse.json({ error: "Forbidden: Requires Super Admin" }, { status: 403 });
        }

        const body = await req.json();
        const { requestId, status } = body; // APPROVED or REJECTED

        if (!["APPROVED", "REJECTED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const existingReq = await prisma.approvalRequest.findUnique({ where: { id: requestId } });
        if (!existingReq) return NextResponse.json({ error: "Request not found" }, { status: 404 });

        const updated = await prisma.approvalRequest.update({
            where: { id: requestId },
            data: {
                status,
                approvedById: session.user.id
            }
        });

        await logAudit({
            userId: session.user.id,
            action: `APPROVAL_REQUEST_${status}`,
            entityType: "ApprovalRequest",
            entityId: requestId,
            oldValue: existingReq.status,
            newValue: status
        });

        return NextResponse.json({ success: true, request: updated });
    } catch (error) {
        console.error("PUT Action Approvals error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

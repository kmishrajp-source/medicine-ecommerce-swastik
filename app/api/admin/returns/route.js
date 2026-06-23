import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Admin lists all return requests (with filters)
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !["ADMIN", "PHARMACIST", "OPS_MANAGER", "SUPPORT"].includes(session.user.role)) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status"); // Filter by Pending, Under_Review, etc.

        const returns = await prisma.returnRequest.findMany({
            where: status ? { status } : {},
            include: {
                order: {
                    select: {
                        id: true,
                        total: true,
                        status: true,
                        createdAt: true,
                        guestName: true,
                        guestPhone: true,
                        user: { select: { name: true, email: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ success: true, returns });
    } catch (error) {
        console.error("Admin returns GET error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch returns." }, { status: 500 });
    }
}

// PATCH: Admin approves/rejects at various stages of approval chain
export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !["ADMIN", "PHARMACIST", "OPS_MANAGER", "SUPPORT"].includes(session.user.role)) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { returnId, stage, decision, notes, refundAmount, refundMethod } = body;
        // stage: "cs", "pharmacist", "ops"
        // decision: "approved", "rejected"

        const ret = await prisma.returnRequest.findUnique({ where: { id: returnId } });
        if (!ret) return NextResponse.json({ success: false, error: "Return request not found." }, { status: 404 });

        let updateData = {};

        if (stage === "cs") {
            updateData.csApproval = decision;
            updateData.csNotes = notes || null;
            updateData.status = decision === "approved" ? "Under_Review" : "Rejected";
        } else if (stage === "pharmacist") {
            if (ret.csApproval !== "approved") {
                return NextResponse.json({ success: false, error: "CS approval required first." }, { status: 400 });
            }
            updateData.pharmacistApproval = decision;
            updateData.pharmacistNotes = notes || null;
            updateData.status = decision === "approved" ? "Under_Review" : "Rejected";
        } else if (stage === "ops") {
            if (ret.csApproval !== "approved" || ret.pharmacistApproval !== "approved") {
                return NextResponse.json({ success: false, error: "Both CS and Pharmacist approval required first." }, { status: 400 });
            }
            updateData.opsApproval = decision;
            updateData.opsNotes = notes || null;
            if (decision === "approved") {
                updateData.status = "Approved";
                updateData.refundAmount = refundAmount || 0;
                updateData.refundMethod = refundMethod || "wallet";
                updateData.refundStatus = "pending";
            } else {
                updateData.status = "Rejected";
            }
        }

        const updated = await prisma.returnRequest.update({
            where: { id: returnId },
            data: { ...updateData, updatedAt: new Date() }
        });

        return NextResponse.json({ success: true, returnRequest: updated });
    } catch (error) {
        console.error("Admin returns PATCH error:", error);
        return NextResponse.json({ success: false, error: "Failed to update return request." }, { status: 500 });
    }
}

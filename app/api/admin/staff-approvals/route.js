import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ACTIONS, hasPermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

const STAFF_ROLES = ['OPERATIONS_MANAGER','SALES_MANAGER','MARKETING_MANAGER','PHARMACIST',
    'WAREHOUSE_STAFF','CUSTOMER_SUPPORT','ORDER_PROCESSING','PROCUREMENT_OFFICER',
    'STORE_KEEPER','DISPATCH_TEAM','SOCIAL_MEDIA_EXECUTIVE','DIGITAL_MARKETING_EXECUTIVE',
    'FINANCE_ACCOUNTS','SALES_STAFF','ADMIN'];

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (!hasPermission(session.user.role, ACTIONS.MANAGE_USERS)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const url = new URL(req.url);
        const filter = url.searchParams.get("filter") || "pending"; // pending | approved | all

        const whereClause = {
            role: { in: STAFF_ROLES }
        };
        if (filter === "pending") whereClause.isApproved = false;
        if (filter === "approved") whereClause.isApproved = true;

        const staff = await prisma.user.findMany({
            where: whereClause,
            select: { id: true, name: true, email: true, role: true, isApproved: true, createdAt: true, lastIpAddress: true },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, staff });
    } catch (error) {
        console.error("GET staff-approvals error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (!hasPermission(session.user.role, ACTIONS.MANAGE_USERS)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { userId, approve } = await req.json();

        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Cannot approve another SUPER_ADMIN (no one can)
        if (targetUser.role === 'SUPER_ADMIN') {
            return NextResponse.json({ error: "Cannot modify Super Admin accounts" }, { status: 403 });
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { isApproved: approve }
        });

        await logAudit({
            userId: session.user.id,
            action: approve ? "STAFF_APPROVED" : "STAFF_REVOKED",
            entityType: "User",
            entityId: userId,
            oldValue: !approve,
            newValue: approve
        });

        return NextResponse.json({ success: true, user: { id: updated.id, isApproved: updated.isApproved } });
    } catch (error) {
        console.error("PUT staff-approvals error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (!hasPermission(session.user.role, ACTIONS.MANAGE_USERS)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { name, email, password, role } = await req.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 400 });

        const bcrypt = (await import("bcryptjs")).default;
        const hashed = await bcrypt.hash(password, 10);

        const staff = await prisma.user.create({
            data: {
                name,
                email,
                password: hashed,
                role,
                isApproved: true // Admin creates directly, so auto-approved
            }
        });

        await logAudit({
            userId: session.user.id,
            action: "STAFF_CREATED",
            entityType: "User",
            entityId: staff.id,
            newValue: { name, email, role }
        });

        return NextResponse.json({ success: true, staff: { id: staff.id, name: staff.name, email: staff.email, role: staff.role } });
    } catch (error) {
        console.error("POST staff-approvals error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

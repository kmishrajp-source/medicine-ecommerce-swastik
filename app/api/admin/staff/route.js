import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { CAN_MANAGE_STAFF, STAFF_ROLES } from '@/lib/permissions';

/**
 * GET /api/admin/staff
 * Returns all staff members (non-customer roles)
 */
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !CAN_MANAGE_STAFF.includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const staff = await prisma.user.findMany({
            where: { role: { in: STAFF_ROLES } },
            select: {
                id: true, name: true, email: true, role: true,
                isApproved: true, createdAt: true, staffDepartment: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, staff });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/**
 * POST /api/admin/staff
 * Create a new staff account
 */
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !CAN_MANAGE_STAFF.includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, email, password, role, staffDepartment } = await req.json();

        if (!email || !password || !role) {
            return NextResponse.json({ error: 'Email, password and role are required' }, { status: 400 });
        }
        if (!STAFF_ROLES.includes(role) || role === 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (existing) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newStaff = await prisma.user.create({
            data: {
                name: name || null,
                email: email.toLowerCase(),
                password: hashedPassword,
                role,
                staffDepartment: staffDepartment || null,
                isApproved: true // admin-created accounts are auto-approved
            },
            select: { id: true, name: true, email: true, role: true, isApproved: true }
        });

        return NextResponse.json({ success: true, staff: newStaff, message: `${role} account created. Login at /staff/login` });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/**
 * PUT /api/admin/staff
 * Update staff name, role, staffDepartment, password
 */
export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !CAN_MANAGE_STAFF.includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, name, password, role, staffDepartment } = await req.json();
        if (!id) return NextResponse.json({ error: 'Staff ID required' }, { status: 400 });

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (role && STAFF_ROLES.includes(role)) updateData.role = role;
        if (staffDepartment !== undefined) updateData.staffDepartment = staffDepartment;
        if (password && password.length >= 6) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updated = await prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, name: true, email: true, role: true, isApproved: true, staffDepartment: true }
        });

        return NextResponse.json({ success: true, staff: updated });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/staff
 * Toggle isApproved (activate/suspend) a staff member
 */
export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !CAN_MANAGE_STAFF.includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, isApproved } = await req.json();
        if (!id) return NextResponse.json({ error: 'Staff ID required' }, { status: 400 });

        await prisma.user.update({ where: { id }, data: { isApproved } });
        return NextResponse.json({ success: true, isApproved });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

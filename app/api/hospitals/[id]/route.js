import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const hospital = await prisma.hospital.findUnique({
            where: { id },
            include: { doctors: true }
        });
        if (!hospital) {
            return NextResponse.json({ success: false, error: "Hospital not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, hospital });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Access Denied: Admins Only" }, { status: 403 });
        }

        const { id } = await params;
        const data = await req.json();

        // Remove relation fields if present in payload
        delete data.doctors;
        delete data.user;
        delete data.appointments;
        delete data.labBookings;

        const updated = await prisma.hospital.update({
            where: { id },
            data
        });

        return NextResponse.json({ success: true, hospital: updated });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Access Denied: Admins Only" }, { status: 403 });
        }

        const { id } = await params;
        await prisma.hospital.delete({ where: { id } });

        return NextResponse.json({ success: true, message: "Hospital deleted successfully" });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

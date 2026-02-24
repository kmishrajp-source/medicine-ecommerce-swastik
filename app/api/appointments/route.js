import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import crypto from "crypto";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        let appointments = [];
        if (session.user.role === 'DOCTOR') {
            // Find doctor profile first
            const doctor = await prisma.doctor.findUnique({ where: { userId: session.user.id } });
            if (doctor) {
                appointments = await prisma.appointment.findMany({
                    where: { doctorId: doctor.id },
                    include: { patient: true },
                    orderBy: { date: 'asc' }
                });
            }
        } else {
            // Patient
            appointments = await prisma.appointment.findMany({
                where: { patientId: session.user.id },
                include: { doctor: { include: { user: true } } },
                orderBy: { date: 'asc' }
            });
        }

        return NextResponse.json({ success: true, appointments });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const {
            doctorId,
            date,
            reason,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature
        } = await req.json();

        // 1. Verify Razorpay Signature securely
        const digest = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpayOrderId + "|" + razorpayPaymentId)
            .digest("hex");

        if (digest !== razorpaySignature) {
            return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
        }

        // 2. Create the confirmed appointment
        const appointment = await prisma.appointment.create({
            data: {
                patientId: session.user.id,
                doctorId: doctorId,
                date: new Date(date),
                reason: reason,
                status: "Confirmed" // Automatically confirmed since paid
            }
        });

        return NextResponse.json({ success: true, appointment });
    } catch (error) {
        console.error("Booking Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

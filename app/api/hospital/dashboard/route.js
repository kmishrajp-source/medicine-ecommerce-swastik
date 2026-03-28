import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'HOSPITAL') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const hospital = await prisma.hospital.findUnique({
            where: { userId: session.user.id }
        });

        if (!hospital) {
            return NextResponse.json({ error: "Hospital profile not found" }, { status: 404 });
        }

        // Fetch Appointments
        const appointments = await prisma.appointment.findMany({
            where: { hospitalId: hospital.id },
            include: { patient: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // Fetch Lab Bookings
        const labBookings = await prisma.labBooking.findMany({
            where: { hospitalId: hospital.id },
            include: { 
                patient: { select: { name: true } },
                test: { select: { name: true, price: true } }
            },
            orderBy: { bookingDate: 'desc' },
            take: 10
        });

        // Calculate Stats (Simulation)
        // In a real system, we'd sum up 'Completed' payments.
        // For simulation, we'll aggregate based on existing data.
        const totalAppointments = await prisma.appointment.count({ where: { hospitalId: hospital.id } });
        const pendingAppointments = await prisma.appointment.count({ 
            where: { hospitalId: hospital.id, status: 'Pending' } 
        });

        // Revenue Simulation: Appointments (500 each) + Lab Tests
        const appointmentRevenue = totalAppointments * 500;
        const totalRevenue = appointmentRevenue;
        const platformComm = totalRevenue * 0.10;
        const netPayout = totalRevenue - platformComm;

        return NextResponse.json({
            success: true,
            stats: {
                totalAppointments,
                pendingAppointments,
                totalRevenue,
                platformDeduction: platformComm,
                netPayout
            },
            appointments,
            labBookings
        });

    } catch (error) {
        console.error("Hospital Dashboard API Error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
    }
}

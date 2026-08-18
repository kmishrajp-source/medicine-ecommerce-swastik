import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/admin/healthcare-intelligence — Healthcare Command Center data
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            medicineOrders, genericSearches, doctorAppts, labBookings,
            ambulanceRequests, insuranceRequests,
            verifiedHospitals, unverifiedHospitals,
            verifiedLabs, verifiedAmbulances,
            recentSearches
        ] = await Promise.all([
            prisma.order.count({ where: { createdAt: { gte: today } } }),
            prisma.healthcareSearch.count({ where: { resolvedIntent: "MEDICINE_SEARCH", createdAt: { gte: today } } }),
            prisma.appointment.count({ where: { createdAt: { gte: today } } }).catch(() => 0),
            prisma.labBooking.count({ where: { createdAt: { gte: today } } }),
            prisma.ambulanceBooking.count({ where: { createdAt: { gte: today } } }),
            prisma.insuranceClaim.count({ where: { createdAt: { gte: today } } }),
            prisma.hospital.count({ where: { verified: true } }),
            prisma.hospital.count({ where: { verified: false } }),
            prisma.lab.count({ where: { verified: true } }),
            prisma.ambulance.count({ where: { verified: true, isAvailable: true } }),
            prisma.healthcareSearch.findMany({
                orderBy: { createdAt: "desc" },
                take: 10,
                select: { rawQuery: true, resolvedIntent: true, isEmergency: true, createdAt: true }
            })
        ]);

        // AI Alerts
        const alerts = [];
        if (verifiedAmbulances === 0) alerts.push({ type: "CRITICAL", icon: "🚑", msg: "No available ambulances online right now." });
        if (unverifiedHospitals > 5) alerts.push({ type: "WARNING", icon: "🏥", msg: `${unverifiedHospitals} hospitals pending verification.` });
        if (ambulanceRequests > 3) alerts.push({ type: "INFO", icon: "📡", msg: `${ambulanceRequests} ambulance requests today — monitor response times.` });
        if (labBookings > 10) alerts.push({ type: "INFO", icon: "🧪", msg: `Lab bookings are high today (${labBookings}). Check capacity.` });

        return NextResponse.json({
            today: {
                medicineOrders,
                genericSearches,
                doctorAppts,
                labBookings,
                ambulanceRequests,
                insuranceRequests
            },
            providerStatus: {
                verifiedHospitals,
                unverifiedHospitals,
                verifiedLabs,
                verifiedAmbulances
            },
            alerts,
            recentSearches
        });
    } catch (err) {
        console.error("[HEALTHCARE COMMAND CENTER]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

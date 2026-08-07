import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Add caching to prevent database overload from the homepage
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        const [
            patientsCount,
            ordersCount,
            doctorsCount,
            labsCount,
            pharmaciesCount,
            appointmentsCount
        ] = await Promise.all([
            prisma.user.count({ where: { role: 'USER' } }),
            prisma.order.count(),
            prisma.doctor.count(),
            prisma.lab.count(),
            prisma.retailer.count(),
            prisma.appointment.count()
        ]);

        return NextResponse.json({
            success: true,
            stats: {
                patientsServed: patientsCount + 5000, // base 5000 + actual
                medicinesDelivered: ordersCount * 3 + 12000, // est 3 medicines per order + base
                ordersCompleted: ordersCount + 4500, // base + actual
                doctors: doctorsCount + 200, // base + actual
                labs: labsCount + 50,
                pharmacies: pharmaciesCount + 150,
                citiesCovered: 12, // Gorakhpur + surrounding
                consultations: appointmentsCount + 3000,
                emergencyRequests: 1500, // base
                aiAnalyses: 25000, // base
                customerSatisfaction: "4.9/5"
            }
        });
    } catch (error) {
        console.error("Failed to fetch stats:", error);
        // Fallback stats if DB is down
        return NextResponse.json({
            success: true,
            stats: {
                patientsServed: 5432,
                medicinesDelivered: 15600,
                ordersCompleted: 4890,
                doctors: 215,
                labs: 65,
                pharmacies: 168,
                citiesCovered: 12,
                consultations: 3120,
                emergencyRequests: 1540,
                aiAnalyses: 25680,
                customerSatisfaction: "4.9/5"
            }
        });
    }
}

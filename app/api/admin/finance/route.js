import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. Medicine Orders (Platform keeps 100% of retail profit, but let's say 10% commission on marketplace model)
        const orders = await prisma.order.aggregate({
            _sum: { total: true },
            where: { status: 'Delivered' }
        });

        // 2. Doctor Appointments (Assuming avg fee ₹500 if not stored, commission 10%)
        // We need to look up Doctor fees. For now, estimate based on count.
        const appointments = await prisma.appointment.count({ where: { status: 'Confirmed' } });
        const doctorRevenue = appointments * 500 * 0.10; // 10% of ₹500

        // 3. Lab Bookings 
        // Need to join LabTest price
        const labBookings = await prisma.labBooking.findMany({
            where: { status: 'Confirmed' },
            include: { test: true }
        });
        const labRevenue = labBookings.reduce((sum, b) => sum + (b.test.price * 0.10), 0);

        // 4. Ambulance (10% of total price)
        const ambulanceBookings = await prisma.ambulanceBooking.aggregate({
            _sum: { totalPrice: true },
            where: { status: 'Completed' }
        });
        const ambulanceRevenue = (ambulanceBookings._sum.totalPrice || 0) * 0.10;

        // 5. Ads (100% Revenue)
        const ads = await prisma.adCampaign.aggregate({
            _sum: { price: true },
            where: { status: { in: ['Active', 'Expired'] } }
        });

        const totalRevenue = (orders._sum.total || 0) * 0.10 // 10% on medicines for marketplace model
            + doctorRevenue
            + labRevenue
            + ambulanceRevenue
            + (ads._sum.price || 0);

        return NextResponse.json({
            success: true,
            data: {
                medicineCommission: (orders._sum.total || 0) * 0.10,
                doctorCommission: doctorRevenue,
                labCommission: labRevenue,
                ambulanceCommission: ambulanceRevenue,
                adRevenue: ads._sum.price || 0,
                totalRevenue
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. Medicine Orders via Retailer DraftInvoices (Dynamic Platform Fee based on agreements)
        const invoices = await prisma.draftInvoice.aggregate({
            _sum: { platformFee: true, retailerAmount: true, customerTotal: true },
            where: { status: 'Approved' } // Or any valid status
        });
        const medicineCommission = invoices._sum.platformFee || 0;

        // Fetch Recent Invoices for the UI
        const recentInvoices = await prisma.draftInvoice.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { subOrder: { include: { retailer: true } } }
        });

        // 2. Doctor Appointments (Assuming avg fee ₹500 if not stored, commission 10%)
        const appointments = await prisma.appointment.count({ where: { status: 'Confirmed' } });
        const doctorRevenue = appointments * 500 * 0.10; // 10% of ₹500

        // 3. Lab Bookings 
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

        const totalRevenue = medicineCommission
            + doctorRevenue
            + labRevenue
            + ambulanceRevenue
            + (ads._sum.price || 0);

        return NextResponse.json({
            success: true,
            data: {
                medicineCommission,
                doctorCommission: doctorRevenue,
                labCommission: labRevenue,
                ambulanceCommission: ambulanceRevenue,
                adRevenue: ads._sum.price || 0,
                totalRevenue,
                recentInvoices
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}


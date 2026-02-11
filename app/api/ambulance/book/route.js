import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    // Allow guest booking for emergencies, but link if logged in

    try {
        const { ambulanceId, pickup, drop, guestName, guestPhone } = await req.json();

        const booking = await prisma.ambulanceBooking.create({
            data: {
                ambulanceId,
                userId: session?.user?.id || null, // Optional
                guestName,
                guestPhone,
                pickupAddress: pickup,
                dropAddress: drop,
                status: "Pending"
            }
        });

        return NextResponse.json({ success: true, booking });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

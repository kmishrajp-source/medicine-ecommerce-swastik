import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Login required to register as partner" }, { status: 401 });

    const { driverName, vehicleNumber, vehicleType, city, phone } = await req.json();

    try {
        const ambulance = await prisma.ambulance.create({
            data: {
                userId: session.user.id,
                driverName,
                vehicleNumber,
                vehicleType,
                city,
                phone
            }
        });

        // Auto-update user role? Or just rely on relations.
        // Let's keep role as CUSTOMER but check relations in logic.
        return NextResponse.json({ success: true, ambulance });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

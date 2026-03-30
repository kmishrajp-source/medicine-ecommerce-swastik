import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const prescriptionId = searchParams.get('prescriptionId');

        const where = { patientId: session.user.id };
        if (prescriptionId) where.id = prescriptionId;

        const prescriptions = await prisma.prescription.findMany({
            where,
            include: {
                quotes: {
                    include: {
                        retailer: {
                            select: {
                                shopName: true,
                                address: true,
                                phone: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, prescriptions });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}


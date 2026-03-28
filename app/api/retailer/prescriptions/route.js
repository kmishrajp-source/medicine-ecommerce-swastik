import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'RETAILER') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch prescriptions that are 'Pending' and not yet linked to an order
        const prescriptions = await prisma.prescription.findMany({
            where: {
                status: 'Pending',
                orderId: null
            },
            include: {
                patient: {
                    select: {
                        name: true,
                        phone: true
                    }
                },
                quotes: {
                    where: {
                        retailer: {
                            userId: session.user.id
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Add a flag if this retailer has already quoted
        const formatted = prescriptions.map(p => ({
            ...p,
            hasQuoted: p.quotes.length > 0
        }));

        return NextResponse.json({ success: true, prescriptions: formatted });
    } catch (error) {
        console.error("Fetch Prescriptions Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}


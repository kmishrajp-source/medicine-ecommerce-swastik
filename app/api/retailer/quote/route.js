import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'RETAILER') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { prescriptionId, quotedAmount, items } = await req.json();

        // Get Retailer record
        const retailer = await prisma.retailer.findUnique({
            where: { userId: session.user.id }
        });

        if (!retailer) {
            return NextResponse.json({ error: "Retailer profile not found" }, { status: 404 });
        }

        // Find existing quote by this retailer for this prescription
        const existingQuote = await prisma.prescriptionQuote.findFirst({
            where: { prescriptionId, retailerId: retailer.id }
        });

        const quote = await (existingQuote 
            ? prisma.prescriptionQuote.update({
                where: { id: existingQuote.id },
                data: { quotedAmount, items, status: 'PENDING' }
              })
            : prisma.prescriptionQuote.create({
                data: { prescriptionId, retailerId: retailer.id, quotedAmount, items, status: 'PENDING' }
              })
        );

        return NextResponse.json({ success: true, quote });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}


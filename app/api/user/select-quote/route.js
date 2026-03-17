import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { quoteId } = await req.json();

        // Find the quote
        const quote = await prisma.prescriptionQuote.findUnique({
            where: { id: quoteId },
            include: { prescription: true }
        });

        if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
        if (quote.prescription.patientId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Transaction: Update selected quote, reject others, mark prescription as processed
        await prisma.$transaction([
            prisma.prescriptionQuote.update({
                where: { id: quoteId },
                data: { status: 'SELECTED' }
            }),
            prisma.prescriptionQuote.updateMany({
                where: { 
                    prescriptionId: quote.prescriptionId,
                    id: { not: quoteId }
                },
                data: { status: 'REJECTED' }
            }),
            prisma.prescription.update({
                where: { id: quote.prescriptionId },
                data: { status: 'Processed' }
            })
        ]);

        return NextResponse.json({ 
            success: true, 
            message: "Quote selected! You can now proceed to checkout.",
            quote 
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

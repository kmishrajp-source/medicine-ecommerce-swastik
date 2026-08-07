import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendWhatsAppText } from "@/lib/whatsapp";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const bills = await prisma.competitorBill.findMany({
            orderBy: { createdAt: 'desc' },
            include: { coupon: true }
        });

        return NextResponse.json({ success: true, bills });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, action } = await req.json(); // action: "APPROVE", "REJECT"
        const bill = await prisma.competitorBill.findUnique({ where: { id } });

        if (!bill) return NextResponse.json({ error: "Not found" }, { status: 404 });

        if (action === "REJECT") {
            const updated = await prisma.competitorBill.update({
                where: { id },
                data: { status: "REJECTED" }
            });
            return NextResponse.json({ success: true, bill: updated });
        }

        if (action === "APPROVE") {
            // Generate unique coupon code
            const code = "SWASTIK-" + Math.random().toString(36).substring(2, 8).toUpperCase();
            
            const coupon = await prisma.coupon.create({
                data: {
                    code,
                    discountType: "FLAT",
                    discountValue: 100.0,
                    minOrderValue: 500.0,
                    description: "Competitor Switch Cashback"
                }
            });

            const updated = await prisma.competitorBill.update({
                where: { id },
                data: { 
                    status: "APPROVED",
                    couponCode: code
                },
                include: { coupon: true }
            });

            // REAL WHATSAPP MESSAGE
            if (updated.phone) {
                await sendWhatsAppText(updated.phone, `🎉 Congratulations! Your Amazon/1mg bill was approved by Swastik Medicare.\n\nUse code *${code}* at checkout to get an instant ₹100 OFF your first order! 🎁\n\nOrder now: https://swastikmed.online`);
            }

            return NextResponse.json({ success: true, bill: updated });
        }

    } catch (error) {
        console.error("Error updating bill:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

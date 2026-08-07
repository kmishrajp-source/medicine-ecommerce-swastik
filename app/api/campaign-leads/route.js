import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWhatsAppText } from "@/lib/whatsapp";

export async function POST(req) {
    try {
        const { name, phone, campaign } = await req.json();

        if (!name || !phone || !campaign) {
            return NextResponse.json({ error: "Name, phone, and campaign are required" }, { status: 400 });
        }

        // Clean phone number
        let cleanPhone = String(phone).replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

        // Check if lead already exists to prevent duplicate coupons/spam
        const existingLead = await prisma.campaignLead.findFirst({
            where: { phone: cleanPhone, campaign }
        });

        if (existingLead) {
            return NextResponse.json({ success: true, message: "Already registered! We have already sent your coupon on WhatsApp." });
        }

        const lead = await prisma.campaignLead.create({
            data: {
                name,
                phone: cleanPhone,
                campaign
            }
        });

        if (campaign === "DIABETES_GORAKHPUR") {
            // Generate a real 20% off coupon
            const code = "DIAB-" + Math.random().toString(36).substring(2, 8).toUpperCase();
            
            await prisma.coupon.create({
                data: {
                    code,
                    discountType: "PERCENTAGE",
                    discountValue: 20.0,
                    maxDiscount: 1000.0,
                    minOrderValue: 200.0,
                    description: "Diabetes Care Campaign 20% Off"
                }
            });

            // Send instant WhatsApp welcome message
            const message = `🎉 Welcome to Swastik Medicare, ${name}!\n\nAs promised, here is your exclusive *20% OFF* coupon for all your diabetes medication: *${code}*\n\nAdditionally, a specialized Swastik Pharmacist has been assigned to you. Reply "HELP" to this message anytime to get a free personalized Diabetes Diet Consultation!\n\nOrder your medicines now: https://swastikmed.online`;
            
            await sendWhatsAppText(cleanPhone, message);
        }

        return NextResponse.json({ success: true, lead });
    } catch (error) {
        console.error("Campaign Lead Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

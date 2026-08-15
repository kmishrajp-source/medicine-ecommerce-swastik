import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { sendSMS } from "@/lib/sms";

// GET /api/admin/retailer-intelligence
// Fetches retailers with geographic distribution, onboarding status, and directory leads
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const city = searchParams.get("city") || "";

        const whereClause = city && city !== "ALL" ? { city: { contains: city, mode: "insensitive" } } : {};

        // Fetch registered & directory retailers
        const retailers = await prisma.retailer.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { name: true, email: true, phone: true }
                },
                _count: {
                    select: { assignedOrders: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        // Summary Statistics
        const stats = {
            total: retailers.length,
            verified: retailers.filter(r => r.verified).length,
            unverified: retailers.filter(r => !r.verified && !r.isDirectory).length,
            directoryLeads: retailers.filter(r => r.isDirectory).length,
            online: retailers.filter(r => r.isOnline).length,
            selfRiders: retailers.filter(r => r.riderPreference === "SELF").length,
            swastikRiders: retailers.filter(r => r.riderPreference === "SWASTIK" || !r.riderPreference).length
        };

        // Unique cities for filter dropdown
        const cities = [...new Set(retailers.map(r => r.city).filter(Boolean))];

        return NextResponse.json({
            success: true,
            stats,
            cities,
            retailers
        });
    } catch (error) {
        console.error("Retailer Intelligence API Error:", error);
        return NextResponse.json({ error: "Failed to fetch retailer intelligence data" }, { status: 500 });
    }
}

// POST /api/admin/retailer-intelligence
// Broadcast WhatsApp / SMS onboarding invitations to directory leads or custom list
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const { targetPhoneNumbers, targetCity, customMessage, channel = "all" } = await req.json();

        let phones = [];

        if (targetPhoneNumbers && targetPhoneNumbers.length > 0) {
            phones = targetPhoneNumbers;
        } else if (targetCity) {
            // Find all directory leads or unverified retailers in this city
            const targets = await prisma.retailer.findMany({
                where: {
                    city: targetCity === "ALL" ? undefined : { contains: targetCity, mode: "insensitive" },
                    verified: false
                },
                select: { phone: true, shopName: true }
            });
            phones = targets.map(t => t.phone).filter(Boolean);
        }

        if (phones.length === 0) {
            return NextResponse.json({ error: "No target phone numbers found for broadcast." }, { status: 400 });
        }

        const registrationLink = "https://www.swastikmed.online/en/retailer/register";
        const defaultMsg = customMessage || `Namaste! Partner with Swastik Medicare to receive customer prescriptions & medicine supply orders in your area. 10% platform commission on guaranteed system prices. Register your pharmacy now: ${registrationLink}`;

        let sentCount = 0;
        let failCount = 0;

        for (const rawPhone of phones) {
            try {
                if (channel === "whatsapp" || channel === "all") {
                    await sendWhatsAppMessage(rawPhone, "retailer_invitation", [defaultMsg, registrationLink]);
                }
                if (channel === "sms" || channel === "all") {
                    await sendSMS(rawPhone, defaultMsg);
                }
                sentCount++;
            } catch (err) {
                console.error(`Broadcast failed for ${rawPhone}:`, err.message);
                failCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Broadcast completed. Sent: ${sentCount}, Failed: ${failCount}`,
            sentCount,
            failCount
        });
    } catch (error) {
        console.error("Retailer Intelligence Broadcast Error:", error);
        return NextResponse.json({ error: "Failed to broadcast invitations" }, { status: 500 });
    }
}

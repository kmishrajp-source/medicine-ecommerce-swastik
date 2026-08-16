import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/admin/riders — List all riders with filters
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status"); // onboardingStatus filter
        const city = searchParams.get("city");
        const verified = searchParams.get("verified");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "30");
        const search = searchParams.get("search");

        const where = {};
        if (status) where.onboardingStatus = status;
        if (city) where.city = { contains: city, mode: "insensitive" };
        if (verified === "true") where.verified = true;
        if (verified === "false") where.verified = false;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { phone: { contains: search } },
                { licenseNumber: { contains: search, mode: "insensitive" } }
            ];
        }

        const [riders, total] = await Promise.all([
            prisma.deliveryAgent.findMany({
                where,
                include: {
                    user: { select: { name: true, email: true } },
                    documents: { select: { docType: true, status: true } },
                    _count: { select: { riderOffers: true, fraudFlags: true } }
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.deliveryAgent.count({ where })
        ]);

        return NextResponse.json({ riders, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        console.error("[ADMIN RIDERS]", err);
        return NextResponse.json({ error: "Failed to fetch riders" }, { status: 500 });
    }
}

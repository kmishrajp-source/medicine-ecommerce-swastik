import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Fetch active ads for display
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const position = searchParams.get('position'); // e.g. "Home-Banner"

    try {
        const ads = await prisma.adCampaign.findMany({
            where: {
                status: 'Active',
                ...(position && { position })
            },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ success: true, ads });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch ads' }, { status: 500 });
    }
}

// POST: Create a new ad (Pharma Company only)
export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });

    // Verify if user is a Pharma Company
    const pharma = await prisma.pharmaCompany.findUnique({ where: { userId: session.user.id } });
    if (!pharma) return NextResponse.json({ error: "Only Pharma Companies can create ads" }, { status: 403 });

    try {
        const { title, imageUrl, targetUrl, position, price } = await req.json();

        const ad = await prisma.adCampaign.create({
            data: {
                companyId: pharma.id,
                title,
                imageUrl,
                targetUrl,
                position, // "Home-Banner", "Sidebar"
                price: parseFloat(price),
                status: 'Active', // Auto-approve for demo
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 30)) // 30 days
            }
        });

        return NextResponse.json({ success: true, ad });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

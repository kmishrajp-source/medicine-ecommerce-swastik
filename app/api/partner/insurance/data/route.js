import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch user with insurance company link
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { insuranceCompany: true }
        });

        if (!user || !user.insuranceCompanyId) {
            return NextResponse.json({ error: "Access Denied. No insurance company linked." }, { status: 403 });
        }

        // Fetch Leads for this specific company
        const leads = await prisma.insuranceLead.findMany({
            where: { companyId: user.insuranceCompanyId },
            include: { plan: true },
            orderBy: { createdAt: 'desc' }
        });

        // Fetch ALL plans for the Directory view
        const directory = await prisma.insurancePlan.findMany({
            include: { company: true },
            orderBy: { companyId: 'asc' }
        });

        return NextResponse.json({
            success: true,
            company: user.insuranceCompany,
            leads,
            directory
        });
    } catch (error) {
        console.error("Insurance partner data fetch error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

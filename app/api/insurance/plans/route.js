import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const coverageType = searchParams.get('coverageType');
        const minPremium = searchParams.get('minPremium');
        const maxPremium = searchParams.get('maxPremium');
        const companyId = searchParams.get('companyId');

        const where = {};
        if (coverageType) where.coverageType = coverageType;
        if (companyId) where.companyId = companyId;
        if (minPremium || maxPremium) {
            where.premium = {};
            if (minPremium) where.premium.gte = parseFloat(minPremium);
            if (maxPremium) where.premium.lte = parseFloat(maxPremium);
        }

        const plans = await prisma.insurancePlan.findMany({
            where,
            include: { company: true },
            orderBy: { premium: 'asc' }
        });

        return NextResponse.json({ success: true, plans });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

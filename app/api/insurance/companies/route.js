import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const companies = await prisma.insuranceCompany.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json({ success: true, companies });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

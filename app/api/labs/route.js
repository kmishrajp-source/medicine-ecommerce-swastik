import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const labs = await prisma.lab.findMany({
            include: { tests: true }
        });
        return NextResponse.json({ success: true, labs });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

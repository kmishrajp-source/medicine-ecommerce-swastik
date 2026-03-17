import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ failure: null });
    }

    try {
        const failure = await prisma.systemFailureLog.findFirst({
            where: {
                userId: session.user.id,
                isResolved: false
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, failure });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

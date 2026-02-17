import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
        return NextResponse.json({ error: "Email required. Usage: /api/setup-admin?email=your@email.com" }, { status: 400 });
    }

    try {
        const user = await prisma.user.update({
            where: { email: email },
            data: { role: 'ADMIN' }
        });

        return NextResponse.json({
            success: true,
            message: `User ${email} is now an ADMIN. You can access the dashboard.`,
            user: { name: user.name, role: user.role }
        });
    } catch (error) {
        return NextResponse.json({ error: "User not found or database error", details: error.message }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email') || "swastikmedicare.help@gmail.com";
        const password = searchParams.get('password') || "Pranshu@2007";

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'ADMIN',
            },
            create: {
                email,
                name: 'Swastik Admin Help',
                password: hashedPassword,
                role: 'ADMIN',
            },
        });

        return NextResponse.json({ success: true, email: user.email, role: user.role, message: "Password updated successfully" });
    } catch (error) {
        console.error("Force reset error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

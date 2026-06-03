import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req) {
    try {
        const hashedPassword = await bcrypt.hash('Pranshu@2007', 10);
        
        // Update default admin
        await prisma.user.upsert({
            where: { email: 'admin@swastik.com' },
            update: { password: hashedPassword, role: 'ADMIN' },
            create: { email: 'admin@swastik.com', name: 'Swastik Admin', password: hashedPassword, role: 'ADMIN' }
        });

        // Update kmishrajp@gmail.com
        await prisma.user.upsert({
            where: { email: 'kmishrajp@gmail.com' },
            update: { password: hashedPassword, role: 'ADMIN' },
            create: { email: 'kmishrajp@gmail.com', name: 'Kaushlesh Mishra', password: hashedPassword, role: 'ADMIN' }
        });

        return NextResponse.json({ success: true, message: "Admin accounts updated. Password is 'Pranshu@2007' for kmishrajp@gmail.com and admin@swastik.com" });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (key !== 'setupadmin123') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let dbUrl = process.env.DATABASE_URL || process.env.PRISMA_DATABASE_URL;
    dbUrl = dbUrl ? dbUrl.trim().replace('\\n', '').replace('\n', '') : null;
    
    if (!dbUrl) {
        return NextResponse.json({ 
            success: false, 
            error: 'No database URL found in environment variables',
            available_env: Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('PRISMA') || k.includes('SUPABASE'))
        }, { status: 500 });
    }

    const prisma = new PrismaClient({
        datasources: { db: { url: dbUrl } }
    });

    try {
        const email = "swastikmedicare.help@gmail.com";
        const plainPassword = "Shivangi@2004";
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const adminUser = await prisma.user.upsert({
            where: { email: email },
            update: {
                password: hashedPassword,
                role: 'ADMIN',
                name: 'Swastik Admin Help'
            },
            create: {
                email: email,
                name: 'Swastik Admin Help',
                password: hashedPassword,
                role: 'ADMIN',
            },
        });

        return NextResponse.json({ 
            success: true, 
            message: 'Admin credentials successfully updated in the production database.',
            email: adminUser.email 
        });
    } catch (error) {
        console.error("Setup error:", error);
        return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

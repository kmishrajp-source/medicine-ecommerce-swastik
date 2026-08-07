import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { explainShortage } from '@/lib/genai';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Access Denied" }, { status: 403 });
        }

        const drugData = await req.json();

        if (!drugData || !drugData.name) {
            return NextResponse.json({ success: false, error: "Drug data required" }, { status: 400 });
        }

        const explanation = await explainShortage(drugData);

        return NextResponse.json({ success: true, explanation });
    } catch (error) {
        console.error("Explain shortage error:", error);
        return NextResponse.json({ success: false, error: "Failed to generate explanation" }, { status: 500 });
    }
}

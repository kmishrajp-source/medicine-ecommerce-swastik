import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Assumed standard NextAuth setup
import { GenerativeAIEngine } from '@/lib/business-intelligence/GenerativeAIEngine';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    // Security: Only allow ADMIN users to access the AI Business Executive
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access only." }, { status: 403 });
    }

    const adminId = session?.user?.id || "local-admin-dev";
    
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ success: false, message: "Message is required." }, { status: 400 });
    }

    const aiResponse = await GenerativeAIEngine.executeBusinessQuery(message, adminId);
    
    return NextResponse.json(aiResponse);

  } catch (error) {
    console.error("AI Executive API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

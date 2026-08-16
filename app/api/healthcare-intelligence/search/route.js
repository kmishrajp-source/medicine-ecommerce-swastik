import { NextResponse } from 'next/server';
import { UnifiedNavigationAgent } from '@/lib/healthcare-intelligence/UnifiedNavigationAgent';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { query, userId } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const result = await UnifiedNavigationAgent.processRequest(query, userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Healthcare Intelligence API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

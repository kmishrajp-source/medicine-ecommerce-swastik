import { NextResponse } from 'next/server';
import { RevenueIntelligenceAgent } from '@/lib/healthcare-intelligence/RevenueIntelligenceAgent';

export async function POST(request) {
  try {
    const { action, params } = await request.json();

    if (action === 'ANALYZE_REVENUE') {
      const insights = await RevenueIntelligenceAgent.analyzeRevenue(params);
      return NextResponse.json({ success: true, insights });
    }

    if (action === 'OPTIMIZE_PRICING') {
      const recommendations = await RevenueIntelligenceAgent.optimizePricing(params);
      return NextResponse.json({ success: true, recommendations });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error('Error in Revenue AI Optimization API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

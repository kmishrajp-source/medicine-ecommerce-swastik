import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const scenario = searchParams.get('scenario') || 'BASE_CASE';

    const forecasts = await prisma.financialForecast.findMany({
      where: {
        scenarioName: scenario,
      },
      orderBy: {
        periodMonths: 'asc',
      },
    });

    return NextResponse.json({ success: true, forecasts });
  } catch (error) {
    console.error('Error fetching forecasts:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const forecast = await prisma.financialForecast.create({
      data: {
        scenarioName: data.scenarioName || 'BASE_CASE',
        periodMonths: parseInt(data.periodMonths || 12),
        projectedRevenue: parseFloat(data.projectedRevenue || 0),
        projectedCOGS: parseFloat(data.projectedCOGS || 0),
        operatingExpense: parseFloat(data.operatingExpense || 0),
        ebitda: parseFloat(data.ebitda || 0),
        cashBurn: parseFloat(data.cashBurn || 0),
        runwayMonths: parseFloat(data.runwayMonths || 0),
        assumptions: data.assumptions || {},
      },
    });

    return NextResponse.json({ success: true, forecast });
  } catch (error) {
    console.error('Error creating forecast:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

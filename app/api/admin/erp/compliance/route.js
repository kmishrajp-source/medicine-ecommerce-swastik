import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'GST'; // 'GST' or 'H1'

    if (type === 'GST') {
      const ledgers = await prisma.erpTaxLedger.findMany({
        orderBy: { date: 'desc' },
        take: 100 // Fetch recent 100 for dashboard
      });

      // Aggregate totals
      let totalInputTax = 0; // Tax paid on purchases
      let totalOutputTax = 0; // Tax collected on sales

      ledgers.forEach(l => {
        const totalTax = l.cgstAmount + l.sgstAmount + l.igstAmount;
        if (l.type === 'INPUT_TAX') totalInputTax += totalTax;
        if (l.type === 'OUTPUT_TAX') totalOutputTax += totalTax;
      });

      return NextResponse.json({
        ledgers,
        summary: {
          inputTax: totalInputTax,
          outputTax: totalOutputTax,
          netLiability: totalOutputTax - totalInputTax
        }
      });
    }

    if (type === 'H1') {
      const registers = await prisma.erpH1Register.findMany({
        orderBy: { dispensedDate: 'desc' },
        take: 200
      });
      return NextResponse.json(registers);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching compliance data:', error);
    return NextResponse.json({ error: 'Failed to fetch compliance data' }, { status: 500 });
  }
}

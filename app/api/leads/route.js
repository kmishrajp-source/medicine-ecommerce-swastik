import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const body = await req.json();
    const { guestPhone, guestEmail, source, notes } = body;

    if (!guestPhone && !guestEmail) {
      return NextResponse.json({ success: false, error: "Contact Info Required" }, { status: 400 });
    }

    // Save lead to the generic CRM Lead table
    const lead = await prisma.lead.create({
      data: {
        serviceType: 'ecommerce_popup',
        guestPhone: guestPhone || null,
        guestEmail: guestEmail || null,
        source: source || 'exit_intent_popup',
        notes: notes || 'Lead captured via FIRST100 exit intent popup',
        status: 'new'
      }
    });

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error("Lead Capture Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

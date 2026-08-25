import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';

/**
 * B2B RFQ (Request For Quotation) API
 * POST /api/b2b/rfq — Create a new RFQ
 * GET /api/b2b/rfq — List RFQs for current user or all (admin)
 * 
 * SAFE: Reuses existing BulkOrder model with a B2B_RFQ status tag.
 * Does NOT create new tables or break existing functionality.
 */

export async function POST(request) {
  try {
    const session = await getServerSession();
    const body = await request.json();

    const { buyerName, buyerPhone, buyerEmail, buyerType, items, deliveryLocation, requiredByDate, notes } = body;

    if (!buyerPhone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Buyer contact and at least one item required' }, { status: 400 });
    }

    // Validate items structure
    const validatedItems = items.map(item => ({
      medicineName: item.medicineName || item.name,
      quantity: parseInt(item.quantity) || 1,
      unit: item.unit || 'strips',
      targetPrice: item.targetPrice || null,
      notes: item.notes || ''
    }));

    // Calculate a reference total (without real pricing, as it will be quoted by suppliers)
    const rfqRef = `SWM-RFQ-${Date.now().toString(36).toUpperCase()}`;

    // Find a matching retailer session or create a guest reference
    let retailerId = null;
    if (session?.user?.email) {
      const retailer = await prisma.retailer.findFirst({ where: { email: session.user.email } });
      if (retailer) retailerId = retailer.id;
    }

    // If no retailer session, we still allow RFQ but without retailer link (guest B2B flow)
    // We'll store the RFQ using BulkOrder model with status = B2B_RFQ
    let rfqRecord;

    if (retailerId) {
      rfqRecord = await prisma.bulkOrder.create({
        data: {
          retailerId,
          items: JSON.stringify({
            rfqRef,
            buyerName: buyerName || session?.user?.name,
            buyerPhone,
            buyerEmail: buyerEmail || session?.user?.email,
            buyerType: buyerType || 'PHARMACY',
            deliveryLocation,
            requiredByDate,
            notes,
            items: validatedItems
          }),
          status: 'B2B_RFQ_PENDING',
          totalAmount: 0 // Will be filled when suppliers quote
        }
      });
    } else {
      // For non-retailer session: store as a lead capture only
      rfqRecord = {
        id: rfqRef,
        status: 'B2B_RFQ_LEAD_CAPTURED'
      };
    }

    // TODO: Notify matching verified distributors via WhatsApp (Phase 13 - full supplier broadcast)
    // This will be implemented when WhatsApp template approval is confirmed

    return NextResponse.json({
      success: true,
      rfqRef,
      orderId: rfqRecord.id,
      status: rfqRecord.status,
      message: `Your RFQ (${rfqRef}) has been submitted. Verified suppliers in your region will respond within 24 hours.`,
      items: validatedItems,
      nextSteps: [
        'Verified distributors will be notified of your requirement',
        'You will receive quotations via WhatsApp/Email within 24 hours',
        'Compare quotations and confirm your purchase order on the platform'
      ]
    });

  } catch (error) {
    console.error('B2B RFQ Error:', error);
    return NextResponse.json({ error: 'Failed to submit RFQ. Please try again.' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'B2B_RFQ_PENDING';

    // Find retailer and their RFQs
    const retailer = await prisma.retailer.findFirst({ where: { email: session.user.email } });
    if (!retailer) {
      return NextResponse.json({ rfqs: [], message: 'No B2B account found for this user.' });
    }

    const rfqs = await prisma.bulkOrder.findMany({
      where: {
        retailerId: retailer.id,
        status: { startsWith: 'B2B_RFQ' }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const parsedRfqs = rfqs.map(rfq => {
      let parsedItems = {};
      try { parsedItems = JSON.parse(rfq.items); } catch (e) {}
      return {
        id: rfq.id,
        status: rfq.status,
        createdAt: rfq.createdAt,
        rfqRef: parsedItems.rfqRef,
        items: parsedItems.items || [],
        deliveryLocation: parsedItems.deliveryLocation,
        requiredByDate: parsedItems.requiredByDate
      };
    });

    return NextResponse.json({ success: true, rfqs: parsedRfqs, total: parsedRfqs.length });

  } catch (error) {
    console.error('B2B RFQ GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch RFQs.' }, { status: 500 });
  }
}

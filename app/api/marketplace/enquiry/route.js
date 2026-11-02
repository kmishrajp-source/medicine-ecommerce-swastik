/**
 * /api/marketplace/enquiry — Legacy singular path
 * 
 * Forwards to the same logic as /api/marketplace/enquiries (plural).
 * Kept for backward compatibility with existing LeadCaptureModal.js
 * which posts to this endpoint.
 */

import { createBuyerEnquiry } from '@/lib/healthmart/store';
import { HEALTHMART_CATEGORIES } from '@/lib/healthmart/categories';

export async function POST(request) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.category && !body.serviceType && !body.requirement) {
      return Response.json(
        { error: 'Please provide a category and describe your requirement.' },
        { status: 400 }
      );
    }

    // Normalize legacy LeadCaptureModal fields to new RFQ schema
    const enquiryData = {
      categoryId: body.categoryId || body.category || 'other',
      title: body.title || body.serviceType || body.requirement || 'Healthcare Enquiry',
      description: body.description || body.requirement || body.message || '',
      location: body.location || body.city || '',
      buyerName: body.buyerName || body.name || 'Anonymous',
      buyerEmail: body.buyerEmail || body.email || '',
      buyerPhone: body.buyerPhone || body.phone || body.mobile || '',
      categoryFields: body.categoryFields || body.fields || {},
      source: 'lead_capture_modal',
    };

    const enquiry = await createBuyerEnquiry(enquiryData);

    return Response.json({
      success: true,
      enquiryNumber: enquiry.enquiryNumber,
      message: 'Your enquiry has been submitted. Providers will respond shortly.',
      trackingUrl: `/healthmart/enquiry/${enquiry.enquiryNumber}`,
    });

  } catch (err) {
    console.error('[/api/marketplace/enquiry POST]', err);
    return Response.json(
      { error: 'Failed to submit enquiry. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json(
    {
      message: 'Swastik HealthMart Enquiry API',
      note: 'POST to this endpoint to submit a healthcare service enquiry.',
      categories: HEALTHMART_CATEGORIES.map(c => ({ id: c.id, name: c.name })),
    }
  );
}


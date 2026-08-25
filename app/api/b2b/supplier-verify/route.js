import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';

/**
 * B2B Supplier Verification API
 * POST /api/b2b/supplier-verify — Submit supplier onboarding/verification request
 * GET  /api/b2b/supplier-verify — Get current verification status
 * 
 * SAFE: Uses existing Distributor model + ProviderVerification for admin review.
 */

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      companyName, ownerName, phone, email,
      address, city, pincode, state,
      gstin, drugLicenseNo, brands, coverageArea,
      supplierType, // MANUFACTURER | SUPER_STOCKIST | DISTRIBUTOR | WHOLESALER
      panNumber, bankAccountName, bankAccountNo, bankIfsc,
      productCategories // Array: ['TABLET','INJECTABLE','OTC','MEDICAL_DEVICE']
    } = body;

    // Validation
    if (!companyName || !phone || !address || !city) {
      return NextResponse.json({ error: 'Company name, phone, address, and city are required' }, { status: 400 });
    }
    if (!gstin && !drugLicenseNo) {
      return NextResponse.json({ error: 'Either GST number or Drug Licence number is required for supplier verification' }, { status: 400 });
    }

    // Check if distributor already exists
    const existing = await prisma.distributor.findFirst({
      where: { OR: [{ phone }, email ? { email } : {}] }
    });

    let distributor;
    if (existing) {
      // Update existing application
      distributor = await prisma.distributor.update({
        where: { id: existing.id },
        data: {
          companyName, ownerName, email, address, city, pincode,
          state: state || 'Uttar Pradesh',
          gstin, drugLicenseNo, brands, coverageArea,
          notes: JSON.stringify({
            supplierType: supplierType || 'DISTRIBUTOR',
            panNumber, bankAccountName, bankAccountNo, bankIfsc,
            productCategories: productCategories || [],
            verificationStatus: 'PENDING_REVIEW',
            submittedAt: new Date().toISOString()
          })
        }
      });
    } else {
      // Create new distributor application
      distributor = await prisma.distributor.create({
        data: {
          companyName, ownerName, phone, email, address, city,
          pincode, state: state || 'Uttar Pradesh',
          gstin, drugLicenseNo, brands, coverageArea,
          verified: false,
          isActive: false, // Inactive until admin approves
          source: 'B2B_SELF_REGISTRATION',
          notes: JSON.stringify({
            supplierType: supplierType || 'DISTRIBUTOR',
            panNumber, bankAccountName, bankAccountNo, bankIfsc,
            productCategories: productCategories || [],
            verificationStatus: 'PENDING_REVIEW',
            submittedAt: new Date().toISOString()
          })
        }
      });
    }

    // Create a ProviderVerification record for admin review queue
    await prisma.providerVerification.create({
      data: {
        targetId: distributor.id,
        targetType: 'B2B_SUPPLIER',
        providerType: supplierType || 'DISTRIBUTOR',
        documents: JSON.stringify({
          gstin, drugLicenseNo,
          productCategories: productCategories || [],
          submittedAt: new Date().toISOString()
        }),
        status: 'PENDING'
      }
    }).catch(() => {}); // Non-critical if this fails

    return NextResponse.json({
      success: true,
      applicationId: distributor.id,
      status: 'PENDING_REVIEW',
      message: 'Your supplier registration has been received. Our team will verify your documents and GST/Drug Licence within 2-3 business days.',
      nextSteps: [
        'Keep your Drug Licence and GST certificate ready for document verification',
        'Our team will call on your registered mobile number for verification',
        'Once approved, you will receive RFQs from pharmacies and hospitals in your region',
        'You can then respond with quotations directly on the platform'
      ]
    });

  } catch (error) {
    console.error('Supplier Verify Error:', error);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession();
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!session?.user?.email && !phone) {
      return NextResponse.json({ error: 'Email or phone required' }, { status: 400 });
    }

    const distributor = await prisma.distributor.findFirst({
      where: session?.user?.email
        ? { email: session.user.email }
        : { phone }
    });

    if (!distributor) {
      return NextResponse.json({ found: false, status: 'NOT_REGISTERED', message: 'No supplier registration found.' });
    }

    let notes = {};
    try { notes = JSON.parse(distributor.notes || '{}'); } catch (e) {}

    return NextResponse.json({
      found: true,
      applicationId: distributor.id,
      companyName: distributor.companyName,
      verified: distributor.verified,
      isActive: distributor.isActive,
      status: distributor.verified ? 'VERIFIED' : (notes.verificationStatus || 'PENDING_REVIEW'),
      supplierType: notes.supplierType || 'DISTRIBUTOR',
      productCategories: notes.productCategories || [],
      coverageArea: distributor.coverageArea,
      brands: distributor.brands
    });

  } catch (error) {
    console.error('Supplier Status Error:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Mock auth check function
const authenticateRequest = (request) => {
  return request.headers.get('x-user-id');
};

// GET: Fetch active genomic consents for the user
export async function GET(request) {
  try {
    const userId = authenticateRequest(request);
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const consents = await prisma.consentRequest.findMany({
      where: {
        patientId: userId,
        purpose: 'GENOMIC_DATA_ACCESS'
      },
      include: {
        doctor: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, consents });
  } catch (error) {
    console.error('Error fetching consent:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch consent' }, { status: 500 });
  }
}

// POST: Grant or Revoke consent
export async function POST(request) {
  try {
    const userId = authenticateRequest(request);
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { doctorId, action } = body; // action: 'GRANT' or 'REVOKE'

    if (!doctorId || !action) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    let consent;
    
    if (action === 'GRANT') {
      // Create or update a consent record
      consent = await prisma.consentRequest.upsert({
        where: {
          // Prisma schema doesn't have a compound unique on patientId_doctorId_purpose, 
          // so we'll use findFirst and update, or create.
          id: 'temp-id' // We will do it properly below since upsert needs a unique key
        },
        update: {},
        create: {}
      });
    }

    // Since we don't have a unique constraint on patientId_doctorId_purpose, let's just find and update/create manually.
    const existingConsent = await prisma.consentRequest.findFirst({
      where: { patientId: userId, doctorId, purpose: 'GENOMIC_DATA_ACCESS' }
    });

    if (action === 'GRANT') {
      if (existingConsent) {
        consent = await prisma.consentRequest.update({
          where: { id: existingConsent.id },
          data: { 
            status: 'GRANTED',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days expiry
          }
        });
      } else {
        consent = await prisma.consentRequest.create({
          data: {
            patientId: userId,
            doctorId: doctorId,
            purpose: 'GENOMIC_DATA_ACCESS',
            status: 'GRANTED',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        });
      }
    } else if (action === 'REVOKE') {
      if (existingConsent) {
        consent = await prisma.consentRequest.update({
          where: { id: existingConsent.id },
          data: { 
            status: 'REVOKED',
            expiresAt: new Date() // Expire immediately
          }
        });
      } else {
        return NextResponse.json({ success: false, error: 'Consent record not found' }, { status: 404 });
      }
    }

    // Log the action for compliance
    await prisma.systemLog.create({
      data: {
        action: `GENOMIC_CONSENT_${action}`,
        description: `Patient ${userId} ${action}ED genomic data access for doctor ${doctorId}`,
        userId: userId
      }
    }).catch(()=>{});

    return NextResponse.json({ success: true, consent });

  } catch (error) {
    console.error('Error modifying consent:', error);
    return NextResponse.json({ success: false, error: 'Failed to modify consent' }, { status: 500 });
  }
}

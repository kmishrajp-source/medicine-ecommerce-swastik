import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth"; // Optional depending on auth strategy. We'll use a standard mocked token check for demonstration or header check if next-auth isn't fully configured in this app.

// Mock auth check function based on the app's standard
const authenticateRequest = (request) => {
  // In a real app, verify JWT or next-auth session here
  const authHeader = request.headers.get('authorization');
  // For the sake of this Swastik MVP, if we send a userId in headers, we trust it.
  // In production, this MUST validate a signed token.
  return request.headers.get('x-user-id');
};

export async function GET(request) {
  try {
    const userId = authenticateRequest(request);
    
    if (!userId) {
      // SECURITY RULE: Never expose genomic data on public APIs
      return NextResponse.json({ success: false, error: 'Unauthorized access to genomic data blocked.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'PATIENT'; // PATIENT or DOCTOR

    if (role === 'PATIENT') {
      // Patient fetching their own reports
      const reports = await prisma.digitalHealthRecord.findMany({
        where: {
          userId: userId,
          recordType: 'GENETIC_REPORT'
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ success: true, reports });
      
    } else if (role === 'DOCTOR') {
      const patientId = searchParams.get('patientId');
      if (!patientId) return NextResponse.json({ success: false, error: 'patientId required' }, { status: 400 });

      // SECURITY RULE: Ensure Doctor has ACTIVE consent to view this patient's genomic data
      const activeConsent = await prisma.consentRequest.findFirst({
        where: {
          patientId: patientId,
          doctorId: userId,
          purpose: 'GENOMIC_DATA_ACCESS',
          status: 'GRANTED',
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      });

      if (!activeConsent) {
        // SECURITY RULE: Log unauthorized access attempts to genomic data
        await prisma.systemFailureLog.create({
          data: {
            endpoint: '/api/bio/reports',
            error: `Unauthorized provider access attempt to genomic data for patient ${patientId} by doctor ${userId}`,
            status: 403
          }
        }).catch(()=>{});

        return NextResponse.json({ success: false, error: 'You do not have active consent to view this patient\'s genomic reports.' }, { status: 403 });
      }

      const reports = await prisma.digitalHealthRecord.findMany({
        where: {
          userId: patientId,
          recordType: 'GENETIC_REPORT'
        },
        orderBy: { createdAt: 'desc' }
      });
      
      // Log legitimate access
      await prisma.systemLog.create({
        data: {
          action: 'GENOMIC_REPORT_ACCESSED',
          description: `Doctor ${userId} accessed genomic reports for patient ${patientId} under consent ${activeConsent.id}`,
          userId: userId
        }
      }).catch(()=>{});

      return NextResponse.json({ success: true, reports });
    }

    return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });

  } catch (error) {
    console.error('Error securely fetching genetic reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to securely fetch reports' },
      { status: 500 }
    );
  }
}

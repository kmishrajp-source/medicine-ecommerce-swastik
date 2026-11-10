import { NextResponse } from 'next/server';
import { getLatestClinical, updateClinicalRecord, addDoctorReview } from '@/lib/precision/memory-store';
import { createDoctorApproval, verifyApproval } from '@/lib/precision/doctor-approval';

export async function POST(request) {
  try {
    const body = await request.json();
    const { patientId, doctorId, doctorName, qualification, registrationNumber, decision, notes, modifications } = body;
    if (!patientId || !decision || !doctorId) return NextResponse.json({ error: 'patientId, doctorId and decision are required' }, { status: 400 });
    if (!['APPROVED', 'REJECTED', 'NEEDS_REVISION'].includes(decision)) return NextResponse.json({ error: 'decision must be APPROVED, REJECTED or NEEDS_REVISION' }, { status: 400 });

    const clinical = getLatestClinical(patientId);
    if (!clinical) return NextResponse.json({ error: 'No clinical evaluation found for patient' }, { status: 404 });

    const approval = createDoctorApproval({ doctorId, doctorName, qualification, registrationNumber, clinicalRecordId: clinical.id, patientId, decision, notes, modifications });
    const { valid } = verifyApproval(approval);
    const review = addDoctorReview({ patientId, clinicalRecordId: clinical.id, ...approval });
    updateClinicalRecord(clinical.id, { status: decision === 'APPROVED' ? 'doctor_approved' : decision === 'REJECTED' ? 'rejected' : 'needs_revision', doctorReviewId: review.id });

    return NextResponse.json({ review, signatureValid: valid, message: `Clinical record ${decision.toLowerCase()} by ${doctorName}` });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


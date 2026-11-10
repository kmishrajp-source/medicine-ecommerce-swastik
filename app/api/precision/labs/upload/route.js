import { NextResponse } from 'next/server';
import { createLabRecord, getPatientById } from '@/lib/precision/memory-store';
import { analyseLabPanel } from '@/lib/precision/biomarker-engine';

export async function POST(request) {
  try {
    const body = await request.json();
    const { patientId, collectionDate, lab, biomarkers } = body;
    if (!patientId || !biomarkers) return NextResponse.json({ error: 'patientId and biomarkers are required' }, { status: 400 });

    const patient = getPatientById(patientId);
    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

    const analysis = analyseLabPanel(biomarkers, patient);
    const record = createLabRecord({ patientId, collectionDate: collectionDate || new Date().toISOString().slice(0, 10), lab: lab || 'Unknown', biomarkers, analysis });

    return NextResponse.json({ record, analysis, message: 'Lab data recorded and analysed' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


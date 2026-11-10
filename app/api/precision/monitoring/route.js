import { NextResponse } from 'next/server';
import { getMonitoringByPatient, addMonitoringEntry, getPatientById } from '@/lib/precision/memory-store';
import { classifyBiomarker } from '@/lib/precision/biomarker-engine';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId');
  if (!patientId) return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
  const entries = getMonitoringByPatient(patientId);
  return NextResponse.json({ entries, count: entries.length });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { patientId, type, value, unit, notes } = body;
    if (!patientId || !type || value === undefined) return NextResponse.json({ error: 'patientId, type and value are required' }, { status: 400 });

    const patient = getPatientById(patientId);
    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

    const status = classifyBiomarker(type, value, patient.gender);
    const alert = !['normal', 'optimal', 'desirable', 'G1', 'at_target'].includes(status);

    const entry = addMonitoringEntry({ patientId, type, value: parseFloat(value), unit, status, alert, notes });
    return NextResponse.json({ entry, alert, message: alert ? `⚠️ ${type} is ${status} — review recommended` : `${type} recorded successfully` }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import { getAllPatients, getPatientById, createPatient } from '@/lib/precision/memory-store';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) {
    const patient = getPatientById(id);
    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    return NextResponse.json({ patient });
  }
  return NextResponse.json({ patients: getAllPatients() });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, age, gender, dob, phone, email, address, bloodGroup, bmi, weight, height, familyHistory, currentMedications, allergies, consent } = body;
    if (!name || !age || !gender) return NextResponse.json({ error: 'name, age, gender are required' }, { status: 400 });
    const patient = createPatient({ name, age, gender, dob, phone, email, address, bloodGroup, bmi, weight, height, familyHistory, currentMedications, allergies, consent });
    return NextResponse.json({ patient, message: 'Patient registered successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


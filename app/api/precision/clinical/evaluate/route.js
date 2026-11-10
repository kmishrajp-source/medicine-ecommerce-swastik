import { NextResponse } from 'next/server';
import { getPatientById, getLatestLab, getLatestGenetics, createClinicalRecord } from '@/lib/precision/memory-store';
import { evaluateClinical } from '@/lib/precision/decision-support';
import { getMedicinesForIndication } from '@/lib/precision/marketplace';

export async function POST(request) {
  try {
    const body = await request.json();
    const { patientId } = body;
    if (!patientId) return NextResponse.json({ error: 'patientId is required' }, { status: 400 });

    const patient = getPatientById(patientId);
    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

    const labData = getLatestLab(patientId);
    const geneticsData = getLatestGenetics(patientId);

    const result = evaluateClinical({ patientId, labData, geneticsData, patientInfo: patient });
    const medicines = getMedicinesForIndication(result.evaluation.diabetesType, geneticsData?.pharmacogenomics);

    const record = createClinicalRecord({ patientId, ...result, medicines });
    return NextResponse.json({ clinicalRecord: record, medicines, message: 'Clinical evaluation complete — pending doctor review' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


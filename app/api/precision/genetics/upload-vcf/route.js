import { NextResponse } from 'next/server';
import { createGeneticsRecord, getPatientById } from '@/lib/precision/memory-store';
import { parseVCF } from '@/lib/precision/vcf-parser';
import { generatePGxReport } from '@/lib/precision/pharmacogenomics';

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let patientId, vcfText, testType, lab, reportDate;

    if (contentType.includes('application/json')) {
      const body = await request.json();
      ({ patientId, vcfText, testType, lab, reportDate } = body);
    } else {
      // Form data with file
      const formData = await request.formData();
      patientId = formData.get('patientId');
      testType = formData.get('testType');
      lab = formData.get('lab');
      reportDate = formData.get('reportDate');
      const file = formData.get('vcfFile');
      if (file) vcfText = await file.text();
    }

    if (!patientId) return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
    const patient = getPatientById(patientId);
    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

    let parsed = null;
    let pgxReport = null;
    if (vcfText) {
      parsed = parseVCF(vcfText);
      pgxReport = generatePGxReport(parsed.pathogenicVariants.concat(parsed.pgxVariants));
    }

    const record = createGeneticsRecord({
      patientId, testType: testType || 'Gene Panel', lab: lab || 'Unknown', reportDate: reportDate || new Date().toISOString().slice(0, 10),
      variants: parsed?.variants || [],
      modyVariants: parsed?.modyVariants || [],
      pgxVariants: parsed?.pgxVariants || [],
      pharmacogenomics: pgxReport?.recommendations || [],
      parsedSummary: parsed?.summary || null,
    });

    return NextResponse.json({ record, parsedSummary: parsed?.summary, pgxReport, warnings: parsed?.warnings, message: 'Genetic data processed' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


/**
 * Swastik Precision Health AI — Clinical Decision Support Engine
 * MODY vs T1D vs T2D vs LADA classification, CKD staging, therapy suggestions
 */

import { getCKDStage } from './biomarker-engine.js';

// ─── Diabetes Type Classifier ─────────────────────────────────────────────────
function classifyDiabetesType({ labData, geneticsData, patientInfo }) {
  const hba1c = labData?.biomarkers?.HbA1c?.value || labData?.HbA1c;
  const cPeptide = labData?.biomarkers?.CPeptide?.value || labData?.CPeptide;
  const variants = geneticsData?.variants || [];
  const pgx = geneticsData?.pharmacogenomics || [];
  const age = patientInfo?.age || 40;
  const bmi = patientInfo?.bmi || 25;
  const familyDM = patientInfo?.familyHistory?.diabetes || false;

  // Check MODY genes
  const modyGenes = ['HNF1A', 'HNF4A', 'GCK', 'HNF1B', 'INS', 'NEUROD1', 'KLF11', 'CEL', 'PAX4', 'ABCC8', 'KCNJ11'];
  const pathogenicMODY = variants.filter(v =>
    modyGenes.includes(v.gene) &&
    ['PATHOGENIC', 'LIKELY_PATHOGENIC'].includes(v.classification)
  );

  // Check T1D markers
  const autoantibodies = labData?.biomarkers?.GADAntibodies || labData?.biomarkers?.IA2 || null;
  const lowCPeptide = cPeptide !== undefined && parseFloat(cPeptide) < 0.5;

  // Scoring
  const scores = { MODY: 0, T1D: 0, LADA: 0, T2D: 0 };

  if (pathogenicMODY.length > 0) scores.MODY += 50;
  if (familyDM) scores.MODY += 10;
  if (age < 25 && !pathogenicMODY.length) scores.MODY += 5;
  if (cPeptide && parseFloat(cPeptide) >= 0.5 && parseFloat(cPeptide) <= 2.0) scores.MODY += 10;

  if (lowCPeptide) { scores.T1D += 30; scores.LADA += 20; }
  if (autoantibodies) { scores.T1D += 25; scores.LADA += 15; }
  if (age < 30 && !pathogenicMODY.length) scores.T1D += 10;

  if (age > 35 && bmi >= 25) scores.T2D += 20;
  if (familyDM && !pathogenicMODY.length) scores.T2D += 10;
  if (cPeptide && parseFloat(cPeptide) > 2.0) scores.T2D += 15;

  if (age > 30 && age < 60 && lowCPeptide) scores.LADA += 15;

  // Normalise to probabilities
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const probs = {};
  for (const [type, score] of Object.entries(scores)) probs[type] = Math.round((score / total) * 100) / 100;

  const primary = Object.entries(probs).sort((a, b) => b[1] - a[1])[0];
  const primaryType = pathogenicMODY.length > 0 ? `MODY (${pathogenicMODY[0].gene} — ${pathogenicMODY[0].condition || pathogenicMODY[0].gene})` : primary[0];

  return {
    primaryDiagnosis: primaryType,
    confidence: pathogenicMODY.length > 0 ? 0.91 : primary[1],
    differentials: Object.entries(probs)
      .filter(([t]) => t !== primary[0])
      .map(([diagnosis, probability]) => ({ diagnosis, probability }))
      .sort((a, b) => b.probability - a.probability),
    pathogenicVariants: pathogenicMODY,
  };
}

// ─── Therapy Suggestions ──────────────────────────────────────────────────────
function suggestTherapy({ diabetesType, labData, geneticsData, patientInfo }) {
  const suggestions = [];
  const contraindications = [];
  const pgx = geneticsData?.pharmacogenomics || [];
  const egfr = labData?.biomarkers?.eGFR?.value;
  const uacr = labData?.biomarkers?.UACR?.value;
  const hba1c = labData?.biomarkers?.HbA1c?.value;

  const cyp2c9 = pgx.find(p => p.gene === 'CYP2C9');
  const slc22a1 = pgx.find(p => p.gene === 'SLC22A1');

  if (diabetesType.includes('MODY3') || diabetesType.includes('HNF1A')) {
    suggestions.push('PREFERRED: Low-dose Sulfonylurea (Glipizide 2.5mg OD) — MODY3 is exquisitely sensitive');
    suggestions.push('DISCONTINUE Metformin — suboptimal in HNF1A-MODY');
    if (cyp2c9?.phenotype?.includes('Intermediate')) {
      suggestions.push('⚠️ CYP2C9 IM: Reduce Sulfonylurea starting dose by 25% (Glipizide 2.5mg instead of 5mg OD)');
      contraindications.push('Avoid Glyburide — higher hypoglycaemia risk in CYP2C9 Intermediate Metabolisers');
    }
    if (cyp2c9?.phenotype?.includes('Poor')) {
      suggestions.push('⚠️ CYP2C9 PM: Reduce Sulfonylurea dose by 50%. Consider DPP-4 inhibitor instead');
      contraindications.push('Avoid Glyburide and Glimepiride in CYP2C9 Poor Metabolisers');
    }
    suggestions.push('Genetic counselling recommended for first-degree relatives');
  } else if (diabetesType.includes('MODY2') || diabetesType.includes('GCK')) {
    suggestions.push('No pharmacotherapy required for GCK-MODY in non-pregnant adults');
    suggestions.push('Lifestyle modification: Mediterranean diet + 150 min moderate exercise/week');
    contraindications.push('Avoid antidiabetic drugs except in pregnancy');
  } else if (diabetesType.includes('T1D')) {
    suggestions.push('Basal-bolus insulin regimen required');
    suggestions.push('Consider continuous glucose monitoring (CGM)');
    contraindications.push('Metformin as sole agent not appropriate');
  } else if (diabetesType.includes('LADA')) {
    suggestions.push('Insulin therapy — do not delay');
    suggestions.push('Avoid sulfonylureas — accelerate beta-cell loss');
  } else {
    // T2D
    if (slc22a1?.phenotype?.includes('Reduced')) {
      suggestions.push('Metformin response may be reduced (SLC22A1). Consider early add-on SGLT-2i or GLP-1 RA');
    } else {
      suggestions.push('Metformin 500mg BD — first-line T2D therapy');
    }
    if (uacr && parseFloat(uacr) >= 30) {
      suggestions.push('SGLT-2 inhibitor (Empagliflozin/Dapagliflozin) — cardio-renal protection indicated');
    }
    if (egfr && parseFloat(egfr) < 45) {
      contraindications.push('Metformin contraindicated if eGFR <30. Use with caution 30–45.');
    }
  }

  // Universal lifestyle
  suggestions.push('Lifestyle: Mediterranean/low-glycaemic diet, 150 min/week moderate aerobic activity, weight management');

  return { suggestions, contraindications };
}

// ─── Monitoring Plan ──────────────────────────────────────────────────────────
function buildMonitoringPlan({ labData, diabetesType }) {
  const hba1c = parseFloat(labData?.biomarkers?.HbA1c?.value || 7);
  const egfr = labData?.biomarkers?.eGFR?.value;

  return {
    HbA1c: hba1c > 8 ? 'Every 3 months until at target, then every 6 months' : 'Every 6 months',
    FastingGlucose: 'Weekly home monitoring; daily if on insulin/sulfonylurea',
    eGFR: egfr && egfr < 60 ? 'Every 3–6 months' : 'Annually',
    UACR: 'Annually',
    LipidProfile: 'Annually',
    Ophthalmology: 'Annual dilated eye exam',
    FootExamination: 'Annual comprehensive foot exam',
    BloodPressure: 'Every clinic visit; target <130/80 mmHg',
    Weight: 'Every clinic visit',
    SelfMonitoring: diabetesType.includes('T1D') || diabetesType.includes('LADA') ? '4–8 times/day (or CGM)' : '1–2 times/day',
  };
}

// ─── Risk Scores ──────────────────────────────────────────────────────────────
function calculateRisk({ labData, patientInfo }) {
  const hba1c = parseFloat(labData?.biomarkers?.HbA1c?.value || 7);
  const ldl = parseFloat(labData?.biomarkers?.LDL?.value || 100);
  const uacr = parseFloat(labData?.biomarkers?.UACR?.value || 15);
  const age = patientInfo?.age || 40;

  const cvRisk = hba1c > 9 || ldl > 160 || age > 60 ? 'High' : hba1c > 7.5 || ldl > 130 ? 'Moderate' : 'Low';
  const nephropathyRisk = uacr >= 300 ? 'High' : uacr >= 30 ? 'Moderate' : 'Low';
  const retinopathyRisk = hba1c > 9 ? 'High' : hba1c > 8 ? 'Moderate' : 'Low';

  return { cardiovascular: cvRisk, nephropathy: nephropathyRisk, retinopathy: retinopathyRisk };
}

// ─── Main Evaluation Engine ───────────────────────────────────────────────────
export function evaluateClinical({ patientId, labData, geneticsData, patientInfo }) {
  const classification = classifyDiabetesType({ labData, geneticsData, patientInfo });
  const { suggestions, contraindications } = suggestTherapy({
    diabetesType: classification.primaryDiagnosis,
    labData,
    geneticsData,
    patientInfo,
  });
  const monitoring = buildMonitoringPlan({ labData, diabetesType: classification.primaryDiagnosis });
  const riskScore = calculateRisk({ labData, patientInfo });

  const egfrVal = labData?.biomarkers?.eGFR?.value;
  const ckd = egfrVal ? getCKDStage(parseFloat(egfrVal)) : null;

  return {
    patientId,
    evaluation: {
      primaryDiagnosis: classification.primaryDiagnosis,
      confidence: classification.confidence,
      differentials: classification.differentials,
      diabetesType: classification.primaryDiagnosis,
      ckdStage: ckd ? `${ckd.stage} — ${ckd.label}` : 'Not assessed',
      riskScore,
      suggestedTherapy: suggestions,
      contraindications,
      monitoring,
    },
    status: 'pending_doctor_review',
    evaluatedAt: new Date().toISOString(),
    disclaimer: 'AI-generated clinical decision support. Must be reviewed and approved by a licensed physician before clinical use.',
  };
}


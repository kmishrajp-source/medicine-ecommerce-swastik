/**
 * Swastik Precision Health AI — Biomarker Engine
 * CKD-EPI 2021, unit normalisation, clinical status classification
 */

// ─── Biomarker Reference Dictionary ──────────────────────────────────────────
export const BIOMARKER_DICT = {
  HbA1c: {
    fullName: 'Glycated Haemoglobin',
    unit: '%',
    ranges: { optimal: [4, 5.7], prediabetes: [5.7, 6.5], diabetes: [6.5, 15], above_target: [7.0, 15] },
    diabetesTarget: '<7.0%',
    description: 'Reflects average blood glucose over 2–3 months.',
  },
  FastingGlucose: {
    fullName: 'Fasting Plasma Glucose',
    unit: 'mg/dL',
    ranges: { normal: [70, 100], impaired: [100, 126], diabetes: [126, 600] },
    siConversion: { factor: 0.0555, unit: 'mmol/L' },
    description: 'Glucose measured after 8+ hours fast.',
  },
  PostMealGlucose: {
    fullName: 'Postprandial Plasma Glucose (2h)',
    unit: 'mg/dL',
    ranges: { normal: [70, 140], above_target: [140, 200], diabetes: [200, 600] },
    diabetesTarget: '<180 mg/dL',
  },
  Creatinine: {
    fullName: 'Serum Creatinine',
    unit: 'mg/dL',
    ranges: { normal: { male: [0.74, 1.35], female: [0.59, 1.04] } },
    siConversion: { factor: 88.4, unit: 'µmol/L' },
  },
  eGFR: {
    fullName: 'Estimated Glomerular Filtration Rate',
    unit: 'mL/min/1.73m²',
    ckdStages: [
      { stage: 'G1', label: 'Normal or High', min: 90, max: 999 },
      { stage: 'G2', label: 'Mildly Decreased', min: 60, max: 89 },
      { stage: 'G3a', label: 'Mildly-Moderately Decreased', min: 45, max: 59 },
      { stage: 'G3b', label: 'Moderately-Severely Decreased', min: 30, max: 44 },
      { stage: 'G4', label: 'Severely Decreased', min: 15, max: 29 },
      { stage: 'G5', label: 'Kidney Failure', min: 0, max: 14 },
    ],
  },
  UACR: {
    fullName: 'Urine Albumin:Creatinine Ratio',
    unit: 'mg/g',
    ranges: { normal: [0, 30], microalbuminuria: [30, 300], macroalbuminuria: [300, 9999] },
    albuminuryStages: [
      { stage: 'A1', label: 'Normal to Mildly Increased', max: 30 },
      { stage: 'A2', label: 'Moderately Increased', min: 30, max: 300 },
      { stage: 'A3', label: 'Severely Increased', min: 300 },
    ],
  },
  CPeptide: {
    fullName: 'C-Peptide',
    unit: 'ng/mL',
    ranges: { low: [0, 0.5], normal: [0.5, 2.0], high: [2.0, 10] },
    interpretation: {
      low: 'Suggests T1D or late-stage T2D — beta-cell failure',
      normal: 'Suggests T2D, MODY, or early T1D',
      high: 'Suggests insulin resistance / T2D',
    },
  },
  TotalCholesterol: { fullName: 'Total Cholesterol', unit: 'mg/dL', ranges: { desirable: [0, 200], borderline: [200, 240], high: [240, 999] } },
  LDL: { fullName: 'LDL Cholesterol', unit: 'mg/dL', ranges: { optimal: [0, 100], borderline: [100, 130], high: [130, 999] } },
  HDL: { fullName: 'HDL Cholesterol', unit: 'mg/dL', ranges: { low: [0, 40], borderline: [40, 60], high: [60, 200] } },
  Triglycerides: { fullName: 'Triglycerides', unit: 'mg/dL', ranges: { normal: [0, 150], borderline: [150, 200], high: [200, 500], veryHigh: [500, 9999] } },
  ALT: { fullName: 'Alanine Aminotransferase', unit: 'U/L', ranges: { normal: { male: [7, 56], female: [7, 45] } } },
  AST: { fullName: 'Aspartate Aminotransferase', unit: 'U/L', ranges: { normal: [10, 40] } },
};

// ─── CKD-EPI 2021 (Race-Free) ─────────────────────────────────────────────────
export function calculateEGFR(creatinine, age, sex) {
  const cr = parseFloat(creatinine);
  const isFemale = sex?.toLowerCase() === 'female';
  const kappa = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;
  const sexMultiplier = isFemale ? 1.012 : 1.0;
  const crKappa = cr / kappa;
  const minVal = Math.min(crKappa, 1);
  const maxVal = Math.max(crKappa, 1);
  const egfr = 142 * Math.pow(minVal, alpha) * Math.pow(maxVal, -1.200) * Math.pow(0.9938, age) * sexMultiplier;
  return Math.round(egfr);
}

// ─── CKD Stage from eGFR ─────────────────────────────────────────────────────
export function getCKDStage(egfr) {
  const stages = BIOMARKER_DICT.eGFR.ckdStages;
  for (const s of stages) {
    if (egfr >= s.min && egfr <= s.max) return s;
  }
  return { stage: 'G5', label: 'Kidney Failure', min: 0, max: 14 };
}

// ─── Unit Normaliser ──────────────────────────────────────────────────────────
export function normaliseUnit(biomarker, value, fromUnit) {
  const dict = BIOMARKER_DICT[biomarker];
  if (!dict) return { value, unit: fromUnit };
  const targetUnit = dict.unit;
  if (!fromUnit || fromUnit === targetUnit) return { value, unit: targetUnit };
  // mmol/L → mg/dL
  if (biomarker === 'FastingGlucose' || biomarker === 'PostMealGlucose') {
    if (fromUnit === 'mmol/L') return { value: Math.round(value / 0.0555 * 10) / 10, unit: 'mg/dL' };
  }
  // µmol/L → mg/dL (Creatinine)
  if (biomarker === 'Creatinine' && fromUnit === 'µmol/L') return { value: Math.round(value / 88.4 * 100) / 100, unit: 'mg/dL' };
  // % HbA1c mmol/mol → %
  if (biomarker === 'HbA1c' && fromUnit === 'mmol/mol') return { value: Math.round((value / 10.929 + 2.15) * 10) / 10, unit: '%' };
  return { value, unit: fromUnit };
}

// ─── Biomarker Status Classifier ─────────────────────────────────────────────
export function classifyBiomarker(biomarker, value, sex) {
  const v = parseFloat(value);
  switch (biomarker) {
    case 'HbA1c':
      if (v < 5.7) return 'normal';
      if (v < 6.5) return 'prediabetes';
      if (v < 7.0) return 'at_target';
      return 'above_target';
    case 'FastingGlucose':
      if (v < 100) return 'normal';
      if (v < 126) return 'impaired';
      return 'diabetes';
    case 'PostMealGlucose':
      if (v < 140) return 'normal';
      if (v < 200) return 'above_target';
      return 'diabetes';
    case 'eGFR': {
      const stage = getCKDStage(v);
      return stage.stage;
    }
    case 'UACR':
      if (v < 30) return 'normal';
      if (v < 300) return 'microalbuminuria';
      return 'macroalbuminuria';
    case 'CPeptide':
      if (v < 0.5) return 'low';
      if (v <= 2.0) return 'normal';
      return 'high';
    case 'TotalCholesterol':
      if (v < 200) return 'desirable';
      if (v < 240) return 'borderline';
      return 'high';
    case 'LDL':
      if (v < 100) return 'optimal';
      if (v < 130) return 'borderline';
      return 'high';
    case 'HDL':
      if (v < 40) return 'low';
      if (v < 60) return 'borderline';
      return 'high';
    case 'Triglycerides':
      if (v < 150) return 'normal';
      if (v < 200) return 'borderline';
      if (v < 500) return 'high';
      return 'very_high';
    default:
      return 'unknown';
  }
}

// ─── Full Lab Panel Analysis ──────────────────────────────────────────────────
export function analyseLabPanel(biomarkers, patientInfo) {
  const results = {};
  const flags = [];

  for (const [name, data] of Object.entries(biomarkers)) {
    const { value, unit } = data;
    const normalised = normaliseUnit(name, value, unit);
    let status = classifyBiomarker(name, normalised.value, patientInfo?.gender);

    // Compute eGFR if creatinine present
    if (name === 'Creatinine' && patientInfo?.age) {
      const egfr = calculateEGFR(normalised.value, patientInfo.age, patientInfo.gender || 'male');
      const ckd = getCKDStage(egfr);
      results['eGFR_computed'] = { value: egfr, unit: 'mL/min/1.73m²', status: ckd.stage, ckdLabel: ckd.label };
    }

    results[name] = { ...normalised, status, originalValue: value, originalUnit: unit };
    if (!['normal', 'optimal', 'desirable', 'G1', 'at_target'].includes(status)) {
      flags.push({ biomarker: name, value: normalised.value, unit: normalised.unit, status });
    }
  }

  return { results, flags, analysedAt: new Date().toISOString() };
}


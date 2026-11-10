/**
 * Swastik Precision Health AI — In-Memory Store
 * Lightweight demo store; no Prisma migrations needed.
 */

import { randomUUID } from 'crypto';

// ─── Seed Demo Patient ────────────────────────────────────────────────────────
const DEMO_PATIENT = {
  id: 'SPH-2026-0018',
  mrn: 'SPH-2026-0018',
  name: 'Rajesh Mishra',
  age: 38,
  gender: 'Male',
  dob: '1988-04-15',
  phone: '+919876543210',
  email: 'rajesh.mishra@example.com',
  address: 'Gorakhpur, Uttar Pradesh',
  bloodGroup: 'B+',
  bmi: 22.9,
  weight: 68,
  height: 172,
  familyHistory: { diabetes: true, type: 'T2D', relation: 'Father' },
  currentMedications: ['Metformin 500mg BD'],
  allergies: ['Sulfa drugs'],
  consent: { dataStorage: true, aiAnalysis: true, doctorReview: true, timestamp: '2026-10-01T09:00:00Z' },
  createdAt: '2026-10-01T09:00:00Z',
  updatedAt: new Date().toISOString(),
};

const DEMO_LAB = {
  id: 'LAB-2026-001',
  patientId: 'SPH-2026-0018',
  collectionDate: '2026-10-15',
  lab: 'Dr. Lal PathLabs, Gorakhpur',
  biomarkers: {
    HbA1c: { value: 7.6, unit: '%', status: 'above_target' },
    FastingGlucose: { value: 138, unit: 'mg/dL', status: 'impaired' },
    PostMealGlucose: { value: 215, unit: 'mg/dL', status: 'above_target' },
    Creatinine: { value: 0.92, unit: 'mg/dL', status: 'normal' },
    eGFR: { value: 104, unit: 'mL/min/1.73m²', status: 'normal', ckdStage: 'G1' },
    UACR: { value: 18.5, unit: 'mg/g', status: 'normal' },
    CPeptide: { value: 1.85, unit: 'ng/mL', status: 'normal' },
    TotalCholesterol: { value: 192, unit: 'mg/dL', status: 'borderline' },
    LDL: { value: 118, unit: 'mg/dL', status: 'borderline' },
    HDL: { value: 42, unit: 'mg/dL', status: 'low' },
    Triglycerides: { value: 164, unit: 'mg/dL', status: 'borderline' },
  },
  createdAt: '2026-10-15T10:00:00Z',
};

const DEMO_GENETICS = {
  id: 'GEN-2026-001',
  patientId: 'SPH-2026-0018',
  testType: 'Targeted Gene Panel',
  lab: 'MedGenome Labs',
  reportDate: '2026-10-10',
  variants: [
    {
      gene: 'HNF1A',
      rsId: 'rs1801261',
      hgvs: 'c.815G>A',
      protein: 'p.Arg272His',
      zygosity: 'Heterozygous',
      classification: 'PATHOGENIC',
      condition: 'MODY3',
      inheritance: 'Autosomal Dominant',
      acmgClass: 'Class V',
    },
  ],
  pharmacogenomics: [
    {
      gene: 'CYP2C9',
      diplotype: '*1/*2',
      phenotype: 'Intermediate Metabolizer',
      drugs: ['Sulfonylureas (Glipizide, Glyburide, Glimepiride)'],
      recommendation: 'Reduce sulfonylurea dose by 25%. Monitor closely for hypoglycaemia.',
      cpicLevel: 'A',
    },
    {
      gene: 'SLC22A1',
      diplotype: 'rs622342 A/C',
      phenotype: 'Reduced Transporter Activity',
      drugs: ['Metformin'],
      recommendation: 'Standard Metformin dosing appropriate. Monitor response.',
      cpicLevel: 'A',
    },
  ],
  createdAt: '2026-10-10T14:00:00Z',
};

const DEMO_CLINICAL = {
  id: 'CLIN-2026-001',
  patientId: 'SPH-2026-0018',
  evaluation: {
    primaryDiagnosis: 'MODY3 (HNF1A Mutation)',
    confidence: 0.91,
    differentials: [
      { diagnosis: 'Type 2 Diabetes', probability: 0.06 },
      { diagnosis: 'Type 1 Diabetes', probability: 0.03 },
    ],
    diabetesType: 'MODY3',
    ckdStage: 'G1 — Normal',
    riskScore: { cardiovascular: 'Moderate', nephropathy: 'Low', retinopathy: 'Low' },
    suggestedTherapy: [
      'Discontinue Metformin — suboptimal in MODY3',
      'Initiate low-dose Sulfonylurea (Glipizide 2.5mg OD) with dose reduction per CYP2C9*2 status',
      'Lifestyle: Mediterranean diet, 150 min moderate aerobic/week',
      'Genetic counselling for first-degree relatives',
    ],
    contraindications: ['Avoid Glyburide — higher hypoglycaemia risk in CYP2C9 IM'],
    monitoring: {
      HbA1c: 'Every 3 months',
      FastingGlucose: 'Weekly home monitoring',
      eGFR: 'Annually',
      UACR: 'Annually',
      Ophthalmology: 'Annual eye exam',
    },
  },
  status: 'pending_doctor_review',
  createdAt: new Date().toISOString(),
};

// ─── In-Memory Collections ────────────────────────────────────────────────────
const store = {
  patients: [DEMO_PATIENT],
  labs: [DEMO_LAB],
  genetics: [DEMO_GENETICS],
  clinical: [DEMO_CLINICAL],
  monitoring: [],
  doctorReviews: [],
};

// ─── Patient CRUD ─────────────────────────────────────────────────────────────
export function getAllPatients() { return store.patients; }
export function getPatientById(id) { return store.patients.find(p => p.id === id || p.mrn === id) || null; }
export function createPatient(data) {
  const patient = { id: `SPH-${Date.now()}`, mrn: `SPH-${Date.now()}`, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  store.patients.push(patient);
  return patient;
}
export function updatePatient(id, data) {
  const idx = store.patients.findIndex(p => p.id === id);
  if (idx === -1) return null;
  store.patients[idx] = { ...store.patients[idx], ...data, updatedAt: new Date().toISOString() };
  return store.patients[idx];
}

// ─── Lab CRUD ─────────────────────────────────────────────────────────────────
export function getLabsByPatient(patientId) { return store.labs.filter(l => l.patientId === patientId); }
export function getLatestLab(patientId) {
  const labs = getLabsByPatient(patientId);
  return labs.sort((a, b) => new Date(b.collectionDate) - new Date(a.collectionDate))[0] || null;
}
export function createLabRecord(data) {
  const lab = { id: `LAB-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
  store.labs.push(lab);
  return lab;
}

// ─── Genetics CRUD ────────────────────────────────────────────────────────────
export function getGeneticsByPatient(patientId) { return store.genetics.filter(g => g.patientId === patientId); }
export function getLatestGenetics(patientId) {
  const recs = getGeneticsByPatient(patientId);
  return recs.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate))[0] || null;
}
export function createGeneticsRecord(data) {
  const record = { id: `GEN-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
  store.genetics.push(record);
  return record;
}

// ─── Clinical CRUD ────────────────────────────────────────────────────────────
export function getClinicalByPatient(patientId) { return store.clinical.filter(c => c.patientId === patientId); }
export function getLatestClinical(patientId) {
  const recs = getClinicalByPatient(patientId);
  return recs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
}
export function createClinicalRecord(data) {
  const record = { id: `CLIN-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
  store.clinical.push(record);
  return record;
}
export function updateClinicalRecord(id, data) {
  const idx = store.clinical.findIndex(c => c.id === id);
  if (idx === -1) return null;
  store.clinical[idx] = { ...store.clinical[idx], ...data };
  return store.clinical[idx];
}

// ─── Monitoring ───────────────────────────────────────────────────────────────
export function getMonitoringByPatient(patientId) { return store.monitoring.filter(m => m.patientId === patientId); }
export function addMonitoringEntry(data) {
  const entry = { id: `MON-${Date.now()}`, ...data, recordedAt: new Date().toISOString() };
  store.monitoring.push(entry);
  return entry;
}

// ─── Doctor Reviews ───────────────────────────────────────────────────────────
export function getDoctorReviews(patientId) { return store.doctorReviews.filter(r => r.patientId === patientId); }
export function addDoctorReview(data) {
  const review = { id: `DR-${randomUUID()}`, ...data, reviewedAt: new Date().toISOString() };
  store.doctorReviews.push(review);
  return review;
}

export { store };


/**
 * Swastik Precision Health AI — Marketplace Integration
 * Bridge to swastikmed.online medicine search, with curated fallbacks
 */

const MARKETPLACE_BASE = process.env.MARKETPLACE_API_URL || 'https://www.swastikmed.online';

// ─── Curated Precision Medicine Fallbacks ─────────────────────────────────────
const PRECISION_MEDICINES = [
  { id: 'glipizide-2.5', name: 'Glipizide 2.5mg', category: 'Sulfonylurea', indication: 'MODY3, T2D', dose: '2.5mg OD before breakfast', note: 'Preferred in MODY3; reduce by 25% in CYP2C9 IM', link: '/shop-medicines?q=glipizide' },
  { id: 'metformin-500', name: 'Metformin 500mg', category: 'Biguanide', indication: 'T2D first-line', dose: '500mg BD with meals', note: 'Avoid in eGFR <30; reduced efficacy in MODY3/SLC22A1 reduced', link: '/shop-medicines?q=metformin' },
  { id: 'empagliflozin-10', name: 'Empagliflozin 10mg', category: 'SGLT-2 Inhibitor', indication: 'T2D + cardio-renal protection', dose: '10mg OD morning', note: 'Preferred when UACR >30 or CVD risk high', link: '/shop-medicines?q=empagliflozin' },
  { id: 'glimepiride-1', name: 'Glimepiride 1mg', category: 'Sulfonylurea', indication: 'T2D, MODY', dose: '1mg OD with breakfast', note: 'Lower dose in CYP2C9 IM/PM; avoid in poor metabolisers', link: '/shop-medicines?q=glimepiride' },
  { id: 'sitagliptin-50', name: 'Sitagliptin 50mg', category: 'DPP-4 Inhibitor', indication: 'T2D add-on', dose: '50–100mg OD', note: 'Alternative when sulfonylurea not suitable', link: '/shop-medicines?q=sitagliptin' },
  { id: 'pioglitazone-15', name: 'Pioglitazone 15mg', category: 'TZD', indication: 'T2D (insulin resistance)', dose: '15–30mg OD', note: 'Enhanced response in PPARG Pro12Ala carriers; monitor fluid retention', link: '/shop-medicines?q=pioglitazone' },
  { id: 'insulin-glargine', name: 'Insulin Glargine (Basaglar/Lantus)', category: 'Basal Insulin', indication: 'T1D, LADA, advanced T2D', dose: 'Once daily at bedtime', note: 'Required for T1D and LADA', link: '/shop-medicines?q=insulin+glargine' },
  { id: 'atorvastatin-10', name: 'Atorvastatin 10mg', category: 'Statin', indication: 'Diabetic dyslipidaemia', dose: '10–20mg OD at night', note: 'Monitor SLCO1B1 — lower myopathy risk than Simvastatin', link: '/shop-medicines?q=atorvastatin' },
  { id: 'losartan-50', name: 'Losartan 50mg', category: 'ARB', indication: 'Diabetic nephropathy, HTN', dose: '50mg OD', note: 'Preferred when microalbuminuria present (UACR 30–300)', link: '/shop-medicines?q=losartan' },
  { id: 'aspirin-75', name: 'Aspirin 75mg', category: 'Antiplatelet', indication: 'CVD risk reduction in DM', dose: '75mg OD with food', note: 'Only if CVD risk high or established disease', link: '/shop-medicines?q=aspirin' },
];

// ─── Search Medicines from Marketplace API ────────────────────────────────────
export async function searchMarketplaceMedicines(query) {
  try {
    const url = `${MARKETPLACE_BASE}/api/medicines?search=${encodeURIComponent(query)}&limit=5`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    return { source: 'marketplace', results: data.medicines || data.results || data, query };
  } catch {
    // Fall back to curated list
    const q = query.toLowerCase();
    const results = PRECISION_MEDICINES.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.indication.toLowerCase().includes(q)
    );
    return { source: 'curated_fallback', results, query };
  }
}

// ─── Get Medicines for Clinical Indication ────────────────────────────────────
export function getMedicinesForIndication(diabetesType, pgxFindings) {
  const cyp2c9 = pgxFindings?.find(p => p.gene === 'CYP2C9');
  const slc22a1 = pgxFindings?.find(p => p.gene === 'SLC22A1');

  let recommended = [];
  let caution = [];
  let avoid = [];

  if (diabetesType?.includes('MODY3') || diabetesType?.includes('HNF1A')) {
    if (cyp2c9?.phenotype?.includes('Intermediate')) {
      recommended.push(PRECISION_MEDICINES.find(m => m.id === 'glipizide-2.5'));
      caution.push({ ...PRECISION_MEDICINES.find(m => m.id === 'glimepiride-1'), caution: 'Use half dose in CYP2C9 IM' });
    } else if (cyp2c9?.phenotype?.includes('Poor')) {
      caution.push({ ...PRECISION_MEDICINES.find(m => m.id === 'sitagliptin-50'), caution: 'Preferred over sulfonylurea in CYP2C9 PM' });
      avoid.push({ ...PRECISION_MEDICINES.find(m => m.id === 'glipizide-2.5'), reason: 'High hypoglycaemia risk in CYP2C9 PM without monitoring' });
    } else {
      recommended.push(PRECISION_MEDICINES.find(m => m.id === 'glipizide-2.5'));
    }
    avoid.push({ ...PRECISION_MEDICINES.find(m => m.id === 'metformin-500'), reason: 'Suboptimal in MODY3/HNF1A' });
  } else if (diabetesType?.includes('T2D')) {
    if (slc22a1?.phenotype?.includes('Reduced')) {
      caution.push({ ...PRECISION_MEDICINES.find(m => m.id === 'metformin-500'), caution: 'Response may be reduced (SLC22A1). Add SGLT-2i early.' });
      recommended.push(PRECISION_MEDICINES.find(m => m.id === 'empagliflozin-10'));
    } else {
      recommended.push(PRECISION_MEDICINES.find(m => m.id === 'metformin-500'));
      recommended.push(PRECISION_MEDICINES.find(m => m.id === 'empagliflozin-10'));
    }
    recommended.push(PRECISION_MEDICINES.find(m => m.id === 'atorvastatin-10'));
  } else if (diabetesType?.includes('T1D') || diabetesType?.includes('LADA')) {
    recommended.push(PRECISION_MEDICINES.find(m => m.id === 'insulin-glargine'));
    avoid.push({ ...PRECISION_MEDICINES.find(m => m.id === 'glipizide-2.5'), reason: 'Sulfonylureas accelerate beta-cell loss in LADA' });
  }

  return {
    recommended: recommended.filter(Boolean),
    caution: caution.filter(Boolean),
    avoid: avoid.filter(Boolean),
    disclaimer: 'Medication recommendations are AI-generated and require physician approval before prescribing.',
  };
}

export { PRECISION_MEDICINES };


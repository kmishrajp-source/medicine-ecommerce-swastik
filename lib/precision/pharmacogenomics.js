/**
 * Swastik Precision Health AI — Pharmacogenomics Engine
 * CPIC Level A/B guidelines for diabetes and metabolic drugs
 */

// ─── CPIC Rules Database ──────────────────────────────────────────────────────
const CPIC_RULES = [
  // CYP2C9 → Sulfonylureas
  {
    gene: 'CYP2C9',
    diplotypes: {
      '*1/*1': 'Normal Metabolizer',
      '*1/*2': 'Intermediate Metabolizer',
      '*1/*3': 'Intermediate Metabolizer',
      '*2/*2': 'Poor Metabolizer',
      '*2/*3': 'Poor Metabolizer',
      '*3/*3': 'Poor Metabolizer',
    },
    drugs: ['Glipizide', 'Glyburide', 'Glimepiride', 'Tolbutamide'],
    recommendations: {
      'Normal Metabolizer': { action: 'Initiate at standard dose.', risk: 'low', doseAdjustment: 'None' },
      'Intermediate Metabolizer': { action: 'Reduce starting dose by 25%. Monitor blood glucose and hypoglycaemia risk.', risk: 'moderate', doseAdjustment: '-25%' },
      'Poor Metabolizer': { action: 'Reduce starting dose by 50%. Consider alternative (e.g. DPP-4i). Frequent monitoring required.', risk: 'high', doseAdjustment: '-50%' },
    },
    cpicLevel: 'A',
    reference: 'CPIC Guideline for CYP2C9 and Sulfonylureas (2019)',
  },
  // SLC22A1 → Metformin
  {
    gene: 'SLC22A1',
    snps: ['rs622342', 'rs628031', 'rs36056065'],
    drugs: ['Metformin'],
    recommendations: {
      'Normal Transporter Activity': { action: 'Standard Metformin dosing. Expected good response.', risk: 'low', doseAdjustment: 'None' },
      'Reduced Transporter Activity': { action: 'Standard dose but response may be reduced. Monitor HbA1c. Consider early add-on therapy.', risk: 'low-moderate', doseAdjustment: 'None' },
      'Markedly Reduced Transporter Activity': { action: 'Metformin likely less effective. Consider alternative first-line (e.g. SGLT-2i, GLP-1 RA).', risk: 'moderate', doseAdjustment: 'Consider alternative' },
    },
    cpicLevel: 'B',
    reference: 'PharmGKB SLC22A1 Metformin Annotation',
  },
  // SLCO1B1 → Statins (relevant for diabetic dyslipidaemia)
  {
    gene: 'SLCO1B1',
    diplotypes: {
      '*1/*1': 'Normal Function',
      '*1/*5': 'Decreased Function',
      '*5/*5': 'Poor Function',
      '*1/*14': 'Decreased Function',
      '*14/*14': 'Poor Function',
    },
    drugs: ['Simvastatin', 'Atorvastatin', 'Rosuvastatin', 'Pitavastatin'],
    recommendations: {
      'Normal Function': { action: 'Standard statin dosing.', risk: 'low', doseAdjustment: 'None' },
      'Decreased Function': { action: 'Avoid high-dose Simvastatin (>20mg). Prefer lower myopathy risk statins (Pravastatin, Fluvastatin).', risk: 'moderate', doseAdjustment: 'Avoid Simvastatin >20mg' },
      'Poor Function': { action: 'Avoid Simvastatin. Use Pravastatin or Fluvastatin at standard dose. CK monitoring recommended.', risk: 'high', doseAdjustment: 'Avoid Simvastatin' },
    },
    cpicLevel: 'A',
    reference: 'CPIC Guideline for SLCO1B1, ABCG2, and Statins (2022)',
  },
  // PPARG → Thiazolidinediones
  {
    gene: 'PPARG',
    snps: { rs1801282: { 'C/C': 'Normal Response', 'C/G': 'Enhanced Response', 'G/G': 'Enhanced Response' } },
    drugs: ['Pioglitazone', 'Rosiglitazone'],
    recommendations: {
      'Normal Response': { action: 'Standard TZD dosing if indicated. Monitor fluid retention and cardiac risk.', risk: 'low', doseAdjustment: 'None' },
      'Enhanced Response': { action: 'TZD may be particularly effective. Monitor closely for fluid retention. Avoid in heart failure.', risk: 'moderate', doseAdjustment: 'Consider lower starting dose' },
    },
    cpicLevel: 'B',
    reference: 'PharmGKB PPARG Pioglitazone Annotation',
  },
  // TCF7L2 → General T2D drug response
  {
    gene: 'TCF7L2',
    snps: { rs7903146: { 'C/C': 'Standard Response', 'C/T': 'Moderate Risk', 'T/T': 'High T2D Risk & Reduced GLP-1 Response' } },
    drugs: ['Sulfonylureas', 'GLP-1 Receptor Agonists'],
    recommendations: {
      'Standard Response': { action: 'Standard therapy selection.', risk: 'low', doseAdjustment: 'None' },
      'Moderate Risk': { action: 'Consider GLP-1 RA therapy. Monitor sulfonylurea response.', risk: 'moderate', doseAdjustment: 'Prefer GLP-1 RA' },
      'High T2D Risk & Reduced GLP-1 Response': { action: 'Sulfonylureas may be preferred over GLP-1 RA. Aggressive lifestyle intervention essential.', risk: 'high', doseAdjustment: 'Prefer Sulfonylurea' },
    },
    cpicLevel: 'B',
    reference: 'PharmGKB TCF7L2 Annotation',
  },
];

// ─── Known MODY Gene → Drug Implications ──────────────────────────────────────
const MODY_DRUG_IMPLICATIONS = {
  HNF1A: {
    modyType: 'MODY3',
    preferredDrug: 'Low-dose Sulfonylurea',
    avoidDrugs: ['Metformin (less effective)', 'High-dose Sulfonylurea without CYP2C9 check'],
    notes: 'MODY3 patients are exquisitely sensitive to sulfonylureas. Start at 25–50% of standard dose. Metformin has limited efficacy in MODY3.',
    reference: 'Hattersley et al., Lancet Diabetes Endocrinol 2018',
  },
  HNF4A: {
    modyType: 'MODY1',
    preferredDrug: 'Low-dose Sulfonylurea',
    avoidDrugs: ['Metformin'],
    notes: 'Similar to MODY3 — high sulfonylurea sensitivity. Neonatal hyperinsulinism possible.',
    reference: 'Hattersley et al., Lancet Diabetes Endocrinol 2018',
  },
  GCK: {
    modyType: 'MODY2',
    preferredDrug: 'No pharmacotherapy (diet only)',
    avoidDrugs: ['All antidiabetic drugs except in pregnancy'],
    notes: 'MODY2 — mild stable fasting hyperglycaemia. Treatment rarely needed. No long-term complications.',
    reference: 'Stride et al., Diabetologia 2002',
  },
  KCNJ11: {
    modyType: 'Neonatal Diabetes / MODY-like',
    preferredDrug: 'High-dose Sulfonylurea (can transfer from insulin)',
    avoidDrugs: ['Insulin (can often be discontinued)'],
    notes: 'Activating mutations — sulfonylurea transfer usually successful. Dramatic improvement expected.',
    reference: 'Pearson et al., NEJM 2006',
  },
};

// ─── Lookup PGx Recommendation ───────────────────────────────────────────────
export function getPGxRecommendation(gene, diplotype, snpGenotype) {
  const rule = CPIC_RULES.find(r => r.gene === gene);
  if (!rule) return null;

  let phenotype = null;
  if (rule.diplotypes && diplotype) {
    phenotype = rule.diplotypes[diplotype] || null;
  } else if (rule.snps && typeof rule.snps === 'object') {
    for (const [snp, genotypes] of Object.entries(rule.snps)) {
      if (genotypes[snpGenotype]) { phenotype = genotypes[snpGenotype]; break; }
    }
  }

  if (!phenotype) return { gene, diplotype, phenotype: 'Unknown', recommendation: 'No specific recommendation available. Consult clinical pharmacist.', cpicLevel: rule.cpicLevel };

  const rec = rule.recommendations[phenotype];
  return {
    gene,
    diplotype: diplotype || snpGenotype,
    phenotype,
    drugs: rule.drugs,
    recommendation: rec?.action || 'See specialist.',
    risk: rec?.risk || 'unknown',
    doseAdjustment: rec?.doseAdjustment || 'None',
    cpicLevel: rule.cpicLevel,
    reference: rule.reference,
  };
}

// ─── MODY Drug Guidance ───────────────────────────────────────────────────────
export function getMODYDrugGuidance(gene) {
  return MODY_DRUG_IMPLICATIONS[gene] || null;
}

// ─── Full PGx Report from Variants Array ─────────────────────────────────────
export function generatePGxReport(variants) {
  const recommendations = [];
  const modyGuidance = [];

  for (const variant of variants) {
    const { gene, diplotype, snpGenotype, classification } = variant;

    // PGx lookup
    const pgxRec = getPGxRecommendation(gene, diplotype, snpGenotype);
    if (pgxRec) recommendations.push(pgxRec);

    // MODY guidance
    if (classification === 'PATHOGENIC' || classification === 'LIKELY_PATHOGENIC') {
      const mody = getMODYDrugGuidance(gene);
      if (mody) modyGuidance.push({ gene, ...mody });
    }
  }

  return {
    recommendations,
    modyGuidance,
    summary: `${recommendations.length} pharmacogenomic recommendations generated. ${modyGuidance.length > 0 ? 'MODY-specific drug guidance included.' : ''}`,
    generatedAt: new Date().toISOString(),
    disclaimer: 'This report is for clinical decision support only. All prescriptions require physician review.',
  };
}


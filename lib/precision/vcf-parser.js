/**
 * Swastik Precision Health AI — VCF Parser
 * Parses VCF 4.2 text, annotates known diabetes/MODY/PGx loci
 */

// ─── Known Loci Annotation Database ──────────────────────────────────────────
const KNOWN_LOCI = {
  rs1801261: { gene: 'HNF1A', condition: 'MODY3', classification: 'PATHOGENIC', hgvs: 'c.815G>A', protein: 'p.Arg272His', acmgClass: 'Class V', inheritance: 'Autosomal Dominant', cpicRelevant: false },
  rs5219: { gene: 'KCNJ11', condition: 'MODY / Neonatal Diabetes', classification: 'LIKELY_PATHOGENIC', hgvs: 'c.67A>G', protein: 'p.Lys23Glu', acmgClass: 'Class IV', inheritance: 'Autosomal Dominant', cpicRelevant: true },
  rs7903146: { gene: 'TCF7L2', condition: 'T2D Risk', classification: 'RISK_VARIANT', hgvs: 'c.IVS3-4832C>T', protein: null, acmgClass: 'Class III', inheritance: 'Complex/Polygenic', cpicRelevant: true },
  rs1801282: { gene: 'PPARG', condition: 'T2D Risk / TZD Response', classification: 'RISK_VARIANT', hgvs: 'c.34C>G', protein: 'p.Pro12Ala', acmgClass: 'Class III', inheritance: 'Complex/Polygenic', cpicRelevant: true },
  rs622342: { gene: 'SLC22A1', condition: 'Metformin Response', classification: 'PHARMACOGENOMIC', hgvs: null, protein: null, acmgClass: 'Class III', inheritance: 'N/A', cpicRelevant: true },
  rs1799853: { gene: 'CYP2C9', condition: 'CYP2C9*2 — Sulfonylurea Metabolism', classification: 'PHARMACOGENOMIC', hgvs: 'c.430C>T', protein: 'p.Arg144Cys', acmgClass: 'Class III', inheritance: 'N/A', cpicRelevant: true },
  rs1057910: { gene: 'CYP2C9', condition: 'CYP2C9*3 — Sulfonylurea Metabolism', classification: 'PHARMACOGENOMIC', hgvs: 'c.1075A>C', protein: 'p.Ile359Leu', acmgClass: 'Class III', inheritance: 'N/A', cpicRelevant: true },
  rs4149056: { gene: 'SLCO1B1', condition: 'Statin Myopathy Risk', classification: 'PHARMACOGENOMIC', hgvs: 'c.521T>C', protein: 'p.Val174Ala', acmgClass: 'Class III', inheritance: 'N/A', cpicRelevant: true },
  rs2268574: { gene: 'HNF4A', condition: 'MODY1', classification: 'LIKELY_PATHOGENIC', hgvs: null, protein: null, acmgClass: 'Class IV', inheritance: 'Autosomal Dominant', cpicRelevant: false },
};

const MODY_GENES = new Set(['HNF1A', 'HNF4A', 'GCK', 'HNF1B', 'INS', 'NEUROD1', 'KLF11', 'CEL', 'PAX4', 'ABCC8', 'KCNJ11']);
const PGX_GENES = new Set(['CYP2C9', 'SLC22A1', 'SLCO1B1', 'PPARG', 'TCF7L2', 'ABCG2']);

// ─── VCF Line Parser ──────────────────────────────────────────────────────────
function parseVCFLine(line) {
  if (!line || line.startsWith('#')) return null;
  const parts = line.trim().split('\t');
  if (parts.length < 5) return null;

  const [chrom, pos, id, ref, alt, qual, filter, infoRaw] = parts;
  const info = {};
  if (infoRaw && infoRaw !== '.') {
    for (const field of infoRaw.split(';')) {
      const eqIdx = field.indexOf('=');
      if (eqIdx > -1) {
        const k = field.slice(0, eqIdx);
        const v = field.slice(eqIdx + 1);
        const num = parseFloat(v);
        info[k] = isNaN(num) ? v : num;
      } else {
        info[field] = true;
      }
    }
  }

  return { chrom, pos: parseInt(pos), id: id !== '.' ? id : null, ref, alt, qual: qual !== '.' ? parseFloat(qual) : null, filter, info };
}

// ─── Annotate Variant ─────────────────────────────────────────────────────────
function annotateVariant(variant) {
  const known = variant.id ? KNOWN_LOCI[variant.id] : null;

  if (known) {
    return {
      ...variant,
      gene: known.gene,
      condition: known.condition,
      classification: known.classification,
      hgvs: known.hgvs,
      protein: known.protein,
      acmgClass: known.acmgClass,
      inheritance: known.inheritance,
      cpicRelevant: known.cpicRelevant,
      rsId: variant.id,
      isMODY: MODY_GENES.has(known.gene),
      isPGx: PGX_GENES.has(known.gene),
      annotationSource: 'swastik_known_loci_v1',
    };
  }

  // Try gene from INFO field
  const gene = variant.info?.GENE || variant.info?.ANN_GENE || null;
  return {
    ...variant,
    gene,
    condition: null,
    classification: 'VARIANT_OF_UNCERTAIN_SIGNIFICANCE',
    hgvs: null,
    protein: null,
    acmgClass: 'Class III',
    inheritance: null,
    cpicRelevant: false,
    rsId: variant.id,
    isMODY: gene ? MODY_GENES.has(gene) : false,
    isPGx: gene ? PGX_GENES.has(gene) : false,
    annotationSource: 'unannotated',
  };
}

// ─── Main VCF Parser ──────────────────────────────────────────────────────────
export function parseVCF(vcfText) {
  const lines = vcfText.split('\n');
  const metadata = {};
  const variants = [];
  let headerLine = null;
  const warnings = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('##')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > -1) {
        const key = trimmed.slice(2, eqIdx);
        const val = trimmed.slice(eqIdx + 1);
        if (!metadata[key]) metadata[key] = val;
      }
    } else if (trimmed.startsWith('#CHROM')) {
      headerLine = trimmed.split('\t');
    } else {
      const parsed = parseVCFLine(trimmed);
      if (parsed) {
        const annotated = annotateVariant(parsed);
        variants.push(annotated);
      }
    }
  }

  const modyVariants = variants.filter(v => v.isMODY);
  const pgxVariants = variants.filter(v => v.isPGx);
  const pathogenic = variants.filter(v => ['PATHOGENIC', 'LIKELY_PATHOGENIC'].includes(v.classification));
  const uncertain = variants.filter(v => v.classification === 'VARIANT_OF_UNCERTAIN_SIGNIFICANCE');

  if (uncertain.length > 0) {
    warnings.push(`${uncertain.length} variant(s) of uncertain significance — manual review recommended.`);
  }

  return {
    metadata,
    variants,
    summary: {
      totalVariants: variants.length,
      modyVariants: modyVariants.length,
      pgxVariants: pgxVariants.length,
      pathogenic: pathogenic.length,
      uncertain: uncertain.length,
    },
    modyVariants,
    pgxVariants,
    pathogenicVariants: pathogenic,
    warnings,
    parsedAt: new Date().toISOString(),
  };
}

// ─── Build Demo VCF String ────────────────────────────────────────────────────
export function buildDemoVCF(patientId) {
  return `##fileformat=VCFv4.2
##fileDate=${new Date().toISOString().slice(0, 10).replace(/-/g, '')}
##source=SwastikPrecisionHealthAI_v1
##reference=GRCh38
##FILTER=<ID=PASS,Description="All filters passed">
##INFO=<ID=GENE,Number=1,Type=String,Description="Gene Name">
#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO
12\t121416678\trs1801261\tG\tA\t999\tPASS\tGENE=HNF1A
19\t45425941\trs7903146\tC\tT\t850\tPASS\tGENE=TCF7L2
10\t96741053\trs1799853\tC\tT\t920\tPASS\tGENE=CYP2C9
`;
}


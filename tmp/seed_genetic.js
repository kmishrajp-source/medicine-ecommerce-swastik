const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting genetic catalog seed...");

  // 1. Create a few generic MasterTests (isTestData: true to comply with rules)
  const tests = [
    {
      name: "BRCA1 & BRCA2 Comprehensive Panel",
      displayName: "BRCA1/BRCA2 Hereditary Cancer Panel",
      shortName: "BRCA Panel",
      testCode: "GEN-BRCA-01",
      category: "Genetic Testing",
      subcategory: "Hereditary Cancer Genetics",
      description: "A comprehensive genetic test analyzing the BRCA1 and BRCA2 genes to identify mutations associated with an increased risk of breast and ovarian cancers.",
      whatIsIt: "This is a genetic test that examines the DNA in your cells to look for specific changes (mutations) in the BRCA1 and BRCA2 genes.",
      whatDoesItDetect: "It detects inherited mutations in the BRCA1 and BRCA2 genes.",
      whyOrdered: "This test may be considered for individuals with a strong personal or family history of breast, ovarian, fallopian tube, or primary peritoneal cancer.",
      resultMeaning: "A positive result indicates the presence of a mutation that increases the risk of certain cancers. A negative result means no mutation was found, but does not eliminate cancer risk.",
      potentialBenefits: "May help identify certain inherited variants. May support clinical decision-making and preventative care strategies.",
      sampleRequirements: "Blood (EDTA tube) or Saliva.",
      preparation: "No special fasting required. Preparation requirements should be confirmed with the selected laboratory.",
      isTestData: true,
      status: "ACTIVE",
      source: "Swastik Verified Catalog"
    },
    {
      name: "Non-Invasive Prenatal Testing (NIPT)",
      displayName: "NIPT - Advanced Screening",
      shortName: "NIPT",
      testCode: "MOL-NIPT-02",
      category: "Molecular Testing",
      subcategory: "Reproductive Genetics",
      description: "A screening test to determine the risk that a fetus will be born with certain genetic abnormalities.",
      whatIsIt: "NIPT analyzes cell-free DNA from the placenta that is present in the mother's blood.",
      whatDoesItDetect: "It screens for common chromosomal aneuploidies like Trisomy 21 (Down syndrome), Trisomy 18, and Trisomy 13.",
      whyOrdered: "Often considered for pregnant women, especially those at advanced maternal age or with an abnormal ultrasound.",
      resultMeaning: "Indicates a high or low risk for the specific conditions screened.",
      potentialBenefits: "Provides early screening information without the risks associated with invasive procedures like amniocentesis.",
      sampleRequirements: "Maternal Blood.",
      preparation: "No special fasting required.",
      isTestData: true,
      status: "ACTIVE",
      source: "Swastik Verified Catalog"
    },
    {
      name: "Whole Exome Sequencing (WES)",
      displayName: "Whole Exome Sequencing",
      shortName: "WES",
      testCode: "GEN-WES-03",
      category: "Genomic Testing",
      subcategory: "Exome Sequencing",
      description: "An advanced genomic test that sequences all the protein-coding regions of genes in a genome.",
      whatIsIt: "WES is a comprehensive genetic test that looks at the 'exome'—the regions of DNA that provide instructions for making proteins.",
      whatDoesItDetect: "It can detect genetic variants across thousands of genes simultaneously.",
      whyOrdered: "May be ordered when a genetic disorder is suspected but specific targeted testing has been inconclusive.",
      resultMeaning: "Results can be complex and are best interpreted by a medical geneticist.",
      potentialBenefits: "Helps investigate complex genetic questions and may identify rare inherited variants.",
      sampleRequirements: "Blood or Saliva.",
      preparation: "Preparation requirements should be confirmed with the selected laboratory.",
      isTestData: true,
      status: "ACTIVE",
      source: "Swastik Verified Catalog"
    }
  ];

  const createdMasterTests = [];
  for (const testData of tests) {
    const mt = await prisma.masterTest.create({
      data: testData
    });
    createdMasterTests.push(mt);
    console.log(`Created Master Test: ${mt.name}`);
  }

  // 2. Find existing Labs to attach offerings to
  // We'll attach these tests to up to 3 existing verified labs
  const labs = await prisma.lab.findMany({
    where: { verified: true },
    take: 3
  });

  if (labs.length === 0) {
    console.warn("No verified labs found in the database. LabOfferings will not be created.");
  } else {
    for (const mt of createdMasterTests) {
      for (const lab of labs) {
        // Randomize price slightly for variation
        const basePrice = mt.name.includes("WES") ? 15000 : (mt.name.includes("BRCA") ? 8000 : 12000);
        const price = basePrice + Math.floor(Math.random() * 2000);
        
        await prisma.labTest.create({
          data: {
            name: mt.displayName || mt.name,
            description: mt.shortName,
            category: "GENETIC",
            price: price,
            turnaroundTime: mt.name.includes("WES") ? "4-6 weeks" : "10-14 days",
            labId: lab.id,
            masterTestId: mt.id,
            status: "ACTIVE"
          }
        });
        console.log(`Attached ${mt.shortName} offering to Lab: ${lab.name}`);
      }
    }
  }

  console.log("Seed complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, '..', 'lib', 'healthmart', 'store.js');
let content = fs.readFileSync(storePath, 'utf8');

const target = `    // Use DB id for consistency
    newEnquiry.id = dbRecord.id;
    newEnquiry._savedToDb = true;
    console.log("[HealthMart] Enquiry saved to DB:", dbRecord.id);`;

const replacement = `    // Use DB id for consistency
    newEnquiry.id = dbRecord.id;
    newEnquiry._savedToDb = true;
    console.log("[HealthMart] Enquiry saved to DB:", dbRecord.id);

    // Persist matched providers in DB for Provider Dashboard
    if (newEnquiry.matches && newEnquiry.matches.length > 0) {
      for (const m of newEnquiry.matches) {
        try {
          await prisma.enquiryProviderMatch.create({
            data: {
              enquiryId: dbRecord.id,
              providerType: m.providerType || 'SUPPLIER',
              providerId: m.providerId || 'sp-gen-001',
              matchScore: m.matchScore || 100.0,
              matchReasons: { reasons: m.matchReasons || [] },
              status: 'MATCHED'
            }
          });
        } catch (matchErr) {
          console.warn("[HealthMart] Note saving match:", matchErr.message);
        }
      }
    }`;

if (!content.includes('Persist matched providers in DB for Provider Dashboard')) {
  const normContent = content.replace(/\r\n/g, '\n');
  const normTarget = target.replace(/\r\n/g, '\n');
  const normReplacement = replacement.replace(/\r\n/g, '\n');
  const updated = normContent.replace(normTarget, normReplacement);
  fs.writeFileSync(storePath, updated, 'utf8');
  console.log('store.js patched with match persistence!');
} else {
  console.log('Already patched.');
}


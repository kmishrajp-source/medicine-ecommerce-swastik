const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTest() {
  try {
    // 1. Find a General Physician in the directory
    const doc = await prisma.doctor.findFirst({
      where: { specialization: { contains: 'General Physician', mode: 'insensitive' } }
    });

    if (!doc) {
      console.log('No General Physician found in the database to test with.');
      return;
    }

    console.log('Found Doctor:', doc.name || 'Unnamed', 'ID:', doc.id);

    // 2. Temporarily make them bookable
    const originalIsDirectory = doc.isDirectory;
    await prisma.doctor.update({
      where: { id: doc.id },
      data: { isDirectory: false, verified: true }
    });
    console.log('Updated doctor to be online bookable (isDirectory: false)');

    // Wait a sec for DB to settle
    await new Promise(r => setTimeout(r, 1000));

    // 3. Test the AI API
    console.log('Testing live AI API...');
    const res = await fetch('https://www.swastikmed.online/api/ai-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I have a headache and fever' })
    });
    const data = await res.json();
    
    console.log('\n=== AI RESPONSE ===');
    console.log(data.success ? data.response : 'ERROR: ' + JSON.stringify(data));
    console.log('===================\n');

    // 4. Revert the doctor
    await prisma.doctor.update({
      where: { id: doc.id },
      data: { isDirectory: originalIsDirectory }
    });
    console.log('Reverted doctor to original state.');

  } catch (err) {
    console.error('Test Failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();

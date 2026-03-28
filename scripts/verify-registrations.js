require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fetch = require('node-fetch');

async function testRegistration(type, name, email) {
    console.log(`\n🧪 Testing registration for: ${type} (${name})`);
    
    // Clean up existing test data if any
    await prisma.user.deleteMany({ where: { email } }).catch(() => {});

    try {
        const response = await fetch('http://localhost:3000/api/partner/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                email,
                password: 'password123',
                phone: '9000000000',
                type,
                specialization: 'Test Specialization',
                hospital: 'Test Hospital',
                experience: '5',
                address: 'Test Address',
                companyName: 'Test Insurance Co'
            })
        });

        const result = await response.json();
        console.log(`Status: ${response.status}`);
        console.log(`Result: ${JSON.stringify(result)}`);

        if (result.success) {
            // Verify in Database
            const user = await prisma.user.findUnique({
                where: { email },
                include: {
                    doctor: true,
                    retailer: true,
                    insuranceCompany: true
                }
            });

            if (user) {
                console.log(`✅ User created in database with role: ${user.role}`);
                if (type === 'doctor' && user.doctor) console.log(`✅ Doctor profile created.`);
                if (type === 'retailer' && user.retailer) console.log(`✅ Retailer profile created.`);
                if (type === 'insurance' && user.insuranceCompanyId) console.log(`✅ Insurance company linked.`);
            } else {
                console.log(`❌ User NOT found in database after success response.`);
            }
        } else {
            console.log(`❌ Registration failed as expected or due to error.`);
        }
    } catch (error) {
        console.error(`❌ Fetch error:`, error.message);
    }
}

async function runTests() {
    const ts = Date.now();
    await testRegistration('doctor', 'Dr. Verify Specialist', `verify-doc-${ts}@test.com`);
    await testRegistration('retailer', 'Verify Pharmacy', `verify-ret-${ts}@test.com`);
    await testRegistration('insurance', 'Verify Health Shield', `verify-ins-${ts}@test.com`);
    
    await prisma.$disconnect();
    console.log('\n--- Tests Completed ---');
}

runTests();

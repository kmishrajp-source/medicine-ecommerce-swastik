const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function simulate() {
    console.log('--- 🚀 Starting Retailer & GPS Simulation ---');

    // 1. Setup Fake Retailer
    const { data: retailer, error: rError } = await supabase
        .from('User')
        .upsert({
            email: 'fake.retailer@swastik.test',
            name: 'Test Fake Pharmacy',
            password: 'hashed_password_placeholder', // In a real test, use bcrypt
            role: 'RETAILER'
        }, { onConflict: 'email' })
        .select()
        .single();

    if (rError) return console.error('❌ Retailer Error:', rError);

    await supabase.from('Retailer').upsert({
        userId: retailer.id,
        shopName: 'Test Fake Pharmacy',
        address: '98-B, Mayur Vihar Phase II, Delhi',
        phone: '7992122974',
        licenseNumber: 'TEST-LIC-12345',
        verified: true,
        lat: 28.6139,
        lng: 77.2090
    });
    console.log('✅ Fake Retailer Verified');

    // 2. Setup Fake Agent
    const { data: agent, error: aError } = await supabase
        .from('User')
        .upsert({
            email: 'fake.agent@swastik.test',
            name: 'Test Agent',
            password: 'hashed_password_placeholder',
            role: 'DELIVERY'
        }, { onConflict: 'email' })
        .select()
        .single();

    if (aError) return console.error('❌ Agent Error:', aError);

    const { data: agentProfile } = await supabase.from('DeliveryAgent').upsert({
        userId: agent.id,
        phone: '7992122974',
        licenseNumber: 'TEST-DL-12345',
        vehicleNumber: 'DL-01-TEST',
        verified: true,
        isOnline: true,
        lat: 28.6139,
        lng: 77.2090
    }).select().single();
    console.log('✅ Fake Agent Online');

    // 3. Create Order
    const { data: order, error: oError } = await supabase.from('Order').insert({
        guestName: 'Test Patient',
        guestPhone: '7992122974',
        address: 'Mayur Vihar Ph 2, Delhi',
        total: 100,
        status: 'Ready_for_Packing',
        paymentMethod: 'COD',
        assignedRetailerId: (await supabase.from('Retailer').select('id').eq('userId', retailer.id).single()).data.id,
        deliveryAgentId: agentProfile.id
    }).select().single();

    if (oError) return console.error('❌ Order Error:', oError);
    console.log('📦 Test Order Created:', order.id);

    // 4. Simulate Movement (GPS Tracking)
    console.log('📍 Simulating GPS Movement (5 steps)...');
    const path = [
        { lat: 28.6139, lng: 77.2090 },
        { lat: 28.6145, lng: 77.2100 },
        { lat: 28.6150, lng: 77.2110 },
        { lat: 28.6155, lng: 77.2120 },
        { lat: 28.6160, lng: 77.2130 }
    ];

    for (let i = 0; i < path.length; i++) {
        const coord = path[i];
        await supabase.from('DeliveryAgent').update({
            lat: coord.lat,
            lng: coord.lng
        }).eq('id', agentProfile.id);

        console.log(`Step ${i + 1}: Agent moved to ${coord.lat}, ${coord.lng}`);
        await new Promise(r => setTimeout(r, 2000)); // Wait 2 seconds between updates
    }

    console.log('✅ Simulation Complete. Track this order at:');
    console.log(`https://medicine-ecommerce-swastik.vercel.app/api/orders/${order.id}/track`);
}

simulate();

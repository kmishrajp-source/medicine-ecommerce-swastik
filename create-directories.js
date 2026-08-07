const { Client } = require('pg');

async function createDirectories() {
    const client = new Client({
        host: 'aws-1-ap-northeast-2.pooler.supabase.com',
        port: 6543,
        user: 'postgres.kklkpnzwxaxekxraqswh',
        password: 'SwastikMedicare@2026',
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Create Hospital Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS "Hospital" (
                "id" TEXT PRIMARY KEY,
                "userId" TEXT UNIQUE,
                "name" TEXT NOT NULL,
                "address" TEXT NOT NULL,
                "city" TEXT DEFAULT 'Gorakhpur',
                "licenseNumber" TEXT,
                "phone" TEXT NOT NULL,
                "email" TEXT,
                "website" TEXT,
                "specialties" TEXT,
                "verified" BOOLEAN DEFAULT false,
                "isDirectory" BOOLEAN DEFAULT false,
                "rating" DOUBLE PRECISION DEFAULT 4.5,
                "ratingCount" INTEGER DEFAULT 0,
                "photoUrl" TEXT,
                "openingHours" TEXT DEFAULT '24/7 Hours',
                "bankDetails" JSONB,
                "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Hospital table created.');

        // Create Doctor Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS "Doctor" (
                "id" TEXT PRIMARY KEY,
                "userId" TEXT UNIQUE,
                "name" TEXT,
                "specialization" TEXT NOT NULL,
                "hospital" TEXT,
                "hospitalId" TEXT REFERENCES "Hospital"("id") ON DELETE SET NULL ON UPDATE CASCADE,
                "city" TEXT DEFAULT 'Gorakhpur',
                "experience" INTEGER,
                "verified" BOOLEAN DEFAULT false,
                "status" TEXT DEFAULT 'unverified',
                "source" TEXT DEFAULT 'field_agent',
                "lat" DOUBLE PRECISION,
                "lng" DOUBLE PRECISION,
                "phone" TEXT,
                "photoUrl" TEXT,
                "consultationFee" DOUBLE PRECISION DEFAULT 500.0,
                "razorpayAccountId" TEXT,
                "isDirectory" BOOLEAN DEFAULT false,
                "location" TEXT,
                "isClaimed" BOOLEAN DEFAULT false,
                "rating" DOUBLE PRECISION DEFAULT 4.0,
                "ratingCount" INTEGER DEFAULT 0,
                "recommendationRate" INTEGER DEFAULT 80,
                "patientStoriesCount" INTEGER DEFAULT 0,
                "openingHours" TEXT DEFAULT '9:00 AM - 5:00 PM',
                "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Doctor table created.');

        // Create Retailer Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS "Retailer" (
                "id" TEXT PRIMARY KEY,
                "userId" TEXT UNIQUE,
                "shopName" TEXT NOT NULL,
                "address" TEXT NOT NULL,
                "licenseNumber" TEXT NOT NULL,
                "phone" TEXT NOT NULL,
                "city" TEXT DEFAULT 'Gorakhpur',
                "verified" BOOLEAN DEFAULT false,
                "isDirectory" BOOLEAN DEFAULT false,
                "rating" DOUBLE PRECISION DEFAULT 4.5,
                "ratingCount" INTEGER DEFAULT 0,
                "status" TEXT DEFAULT 'unverified',
                "source" TEXT DEFAULT 'field_agent',
                "lat" DOUBLE PRECISION,
                "lng" DOUBLE PRECISION,
                "photoUrl" TEXT,
                "openingHours" TEXT DEFAULT '9:00 AM - 10:00 PM',
                "isOnline" BOOLEAN DEFAULT false,
                "priority_score" INTEGER DEFAULT 0,
                "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Retailer table created.');

        // Grant Permissions
        await client.query('GRANT ALL ON TABLE "Hospital" TO anon, authenticated, service_role;');
        await client.query('GRANT ALL ON TABLE "Doctor" TO anon, authenticated, service_role;');
        await client.query('GRANT ALL ON TABLE "Retailer" TO anon, authenticated, service_role;');
        console.log('✅ Permissions granted.');

        // Reload Schema Cache
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log('✅ Schema cache reloaded.');

    } catch (err) {
        console.error('❌ Failed:', err.message);
    } finally {
        await client.end();
    }
}

createDirectories();

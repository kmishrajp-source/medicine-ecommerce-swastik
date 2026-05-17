
const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function init() {
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
        console.log('✅ Connected to database.');

        const sql = `
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT DEFAULT 'CUSTOMER'
);

CREATE TABLE IF NOT EXISTS "Hospital" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT DEFAULT 'Gorakhpur',
    "phone" TEXT,
    "verified" BOOLEAN DEFAULT false,
    "isDirectory" BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS "Doctor" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT,
    "specialization" TEXT,
    "hospital" TEXT,
    "hospitalId" TEXT,
    "city" TEXT DEFAULT 'Gorakhpur',
    "phone" TEXT,
    "verified" BOOLEAN DEFAULT false,
    "isDirectory" BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS "Retailer" (
    "id" TEXT PRIMARY KEY,
    "shopName" TEXT,
    "address" TEXT,
    "licenseNumber" TEXT,
    "phone" TEXT,
    "city" TEXT DEFAULT 'Gorakhpur',
    "verified" BOOLEAN DEFAULT false,
    "isDirectory" BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "image" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "requiresPrescription" BOOLEAN DEFAULT false,
    "salt" TEXT,
    "manufacturer" TEXT,
    "brand" TEXT,
    "mrp" DOUBLE PRECISION DEFAULT 0.0,
    "discount" DOUBLE PRECISION DEFAULT 0.0,
    "isOTC" BOOLEAN DEFAULT false
);
        `;

        console.log('🔨 Executing schema initialization...');
        await client.query(sql);
        console.log('✅ Schema initialized successfully!');
        
    } catch (err) {
        console.error('❌ Initialization failed:', err.message);
    } finally {
        await client.end();
    }
}

init();

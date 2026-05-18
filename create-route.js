const fs = require('fs');
const sql = fs.readFileSync('new_schema.sql', 'utf16le');

const template = `import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
    try {
        const sql = \`
${sql.replace(/`/g, '\\`')}
        \`;
        
        console.log("Attempting database schema creation...");
        
        try {
            // First attempt to execute the SQL directly
            await prisma.$executeRawUnsafe(sql);
            return NextResponse.json({ success: true, message: 'Database schema successfully created from scratch!' });
        } catch (err) {
            console.log("Direct schema execution failed (likely due to existing tables). Re-trying with Schema Reset...");
            
            // Drop schema public and recreate it to clean the database, then execute the full SQL script
            await prisma.$executeRawUnsafe('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
            await prisma.$executeRawUnsafe(sql);
            
            return NextResponse.json({ success: true, message: 'Database schema successfully reset and fully created!' });
        }
    } catch (e) {
        return NextResponse.json({ success: false, error: e.message, fullError: e });
    }
}`;

fs.writeFileSync('app/api/admin/setup-db/route.js', template, 'utf8');
console.log('Successfully wrote route.js');

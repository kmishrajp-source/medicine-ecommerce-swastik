const fs = require('fs');
const sql = fs.readFileSync('new_schema.sql', 'utf16le');
const template = `import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
    try {
        const sql = \`
${sql.replace(/`/g, '\\`')}
        \`;
        
        // Use Prisma's unsafe raw to avoid query plan caching issues
        // and allow executing full DDL statements at once
        await prisma.$executeRawUnsafe(sql);
        
        return NextResponse.json({ success: true, message: 'Database schema fully executed' });
    } catch (e) {
        return NextResponse.json({ success: false, error: e.message, fullError: e });
    }
}`;
fs.writeFileSync('app/api/admin/setup-db/route.js', template, 'utf8');
console.log('Successfully wrote route.js');

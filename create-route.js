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
        
        // Helper function to clean and split SQL statements
        const getStatements = (rawSql) => {
            return rawSql
                .replace(/--.*/g, '') // Remove single-line comments
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);
        };

        const executeStatements = async (statements) => {
            for (const stmt of statements) {
                try {
                    await prisma.$executeRawUnsafe(stmt);
                } catch (err) {
                    // Ignore errors where tables/indexes already exist if we are not resetting
                    if (!err.message.includes('already exists')) {
                        throw err;
                    }
                }
            }
        };

        const statements = getStatements(sql);

        try {
            // First attempt: Try executing statements one by one
            await executeStatements(statements);
            return NextResponse.json({ success: true, message: 'Database schema successfully synced statement-by-statement!' });
        } catch (err) {
            console.log("Direct statement execution failed. Re-trying with Schema Reset...", err.message);
            
            // Clean/Reset public schema
            await prisma.$executeRawUnsafe('DROP SCHEMA public CASCADE');
            await prisma.$executeRawUnsafe('CREATE SCHEMA public');
            
            // Re-execute all statements on the clean schema
            for (const stmt of statements) {
                await prisma.$executeRawUnsafe(stmt);
            }
            
            return NextResponse.json({ success: true, message: 'Database schema successfully reset and recreated statement-by-statement!' });
        }
    } catch (e) {
        return NextResponse.json({ success: false, error: e.message, fullError: e });
    }
}`;

fs.writeFileSync('app/api/admin/setup-db/route.js', template, 'utf8');
console.log('Successfully wrote route.js');

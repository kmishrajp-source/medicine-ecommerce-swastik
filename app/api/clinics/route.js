import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'gorakhpur-healthcare.json');
        const fileData = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileData);
        
        const clinics = data.filter(item => item.type === 'clinic');
        
        return NextResponse.json({ success: true, clinics });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

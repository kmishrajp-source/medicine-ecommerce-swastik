import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'gorakhpur-healthcare.json');
        const fileData = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileData);
        
        const retailers = data.filter(item => item.type === 'retailer');
        
        return NextResponse.json({ success: true, retailers });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch retailers' }, { status: 500 });
    }
}

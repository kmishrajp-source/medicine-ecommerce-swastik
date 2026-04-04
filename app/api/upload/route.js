import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }

        // Validate type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, WEBP, and PDF are allowed." }, { status: 400 });
        }

        // Validate size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File size exceeds 5MB limit." }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate a unique filename
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        // Upload to Supabase Storage
        // NOTE: A public bucket named 'prescriptions' must exist in the Supabase project
        const { data, error } = await supabase
            .storage
            .from('prescriptions')
            .upload(filename, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (error) {
            console.error("Supabase Storage Error:", error);
            // Provide a developer-friendly error message if the bucket is missing
            if (error.message.includes('Bucket not found') || error.message.includes('row-level security')) {
                 return NextResponse.json({ error: "Storage configuration error. Please ensure the 'prescriptions' bucket exists and has correct policies." }, { status: 500 });
            }
            return NextResponse.json({ error: "Failed to upload to cloud storage." }, { status: 500 });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('prescriptions')
            .getPublicUrl(data.path);

        return NextResponse.json({ success: true, url: publicUrl });
    } catch (error) {
        console.error("Upload API Error:", error);
        return NextResponse.json({ error: "Internal server error during upload." }, { status: 500 });
    }
}

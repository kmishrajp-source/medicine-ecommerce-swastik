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
        const validTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, WEBP, and PDF are allowed." }, { status: 400 });
        }

        // Validate size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "File size exceeds 10MB limit." }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64DataUri = `data:${file.type};base64,${buffer.toString('base64')}`;
        const sanitizedName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'document';
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${sanitizedName}`;

        // Attempt upload to Supabase Storage if configured
        try {
            const { data, error } = await supabase
                .storage
                .from('prescriptions')
                .upload(filename, buffer, {
                    contentType: file.type,
                    upsert: false
                });

            if (!error && data?.path) {
                const { data: { publicUrl } } = supabase
                    .storage
                    .from('prescriptions')
                    .getPublicUrl(data.path);

                return NextResponse.json({ success: true, url: publicUrl, filename: file.name });
            } else if (error) {
                console.warn("[Upload] Supabase storage upload returned error, falling back to data URI:", error.message);
            }
        } catch (storageErr) {
            console.warn("[Upload] Supabase storage exception, falling back to data URI:", storageErr.message);
        }

        // Fallback: Return base64 data URI so the file upload never fails!
        return NextResponse.json({ success: true, url: base64DataUri, filename: file.name });
    } catch (error) {
        console.error("Upload API Error:", error);
        return NextResponse.json({ error: "Internal server error during upload." }, { status: 500 });
    }
}

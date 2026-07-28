import { NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';
import genericMedicinesData from '@/data/generic-medicines.json';

// Known medicine brand and generic names for matching
const ALL_MEDICINE_NAMES = [];
for (const med of genericMedicinesData) {
    const genericWords = med.genericName.split(/[ ,+()]/g).filter(w => w.length > 3).map(w => w.toLowerCase());
    const brandWords = med.commonBrand.split(/[/,]/g).map(b => b.trim().toLowerCase()).filter(b => b.length > 3);
    ALL_MEDICINE_NAMES.push(...genericWords, ...brandWords);
}
const UNIQUE_MEDICINES = [...new Set(ALL_MEDICINE_NAMES)];

/**
 * Parses extracted OCR text and finds medicine names.
 */
function parsePrescriptionText(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const foundMedicines = [];
    const lowerText = text.toLowerCase();

    for (const med of UNIQUE_MEDICINES) {
        if (lowerText.includes(med) && !foundMedicines.includes(med)) {
            foundMedicines.push(med);
        }
    }

    // Also look for Rx, Tab., Cap., Syp. patterns
    const rxPattern = /(?:tab\.|cap\.|syp\.|inj\.|drops?|oint\.?|gel)\s+([a-zA-Z0-9\s-]{3,30})/gi;
    let match;
    while ((match = rxPattern.exec(text)) !== null) {
        const name = match[1].trim().toLowerCase();
        if (name.length > 2 && !foundMedicines.includes(name)) {
            foundMedicines.push(name);
        }
    }

    return { foundMedicines, rawLines: lines };
}

export async function POST(req) {
    try {
        const formData = await req.formData();
        const imageFile = formData.get('image');

        if (!imageFile) {
            return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
        }

        // Convert file to buffer
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Run Tesseract OCR
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(buffer);
        await worker.terminate();

        // Parse the extracted text for medicine names
        const { foundMedicines, rawLines } = parsePrescriptionText(text);

        // Build a helpful response
        let responseText = '';
        if (foundMedicines.length > 0) {
            responseText = `✅ **Prescription Scanned Successfully!**\n\nI found **${foundMedicines.length} medicine(s)** in your prescription:\n\n`;
            for (const med of foundMedicines) {
                const shopUrl = `https://swastikmed.online/en/shop-medicines?q=${encodeURIComponent(med)}`;
                responseText += `💊 **${med}** → [Search & Order](${shopUrl})\n`;
            }
            responseText += `\n🛒 **[View All in Cart-Ready Format](https://swastikmed.online/en/shop-medicines)**\n\n`;
            responseText += `⚠️ _Prescription medicines require a valid doctor's prescription for dispensing._`;
        } else {
            responseText = `⚠️ **Could Not Identify Medicines**\n\nI scanned the image but couldn't clearly identify medicine names. This may be due to:\n- Handwriting being difficult to read\n- Low image quality\n\n📞 **Please WhatsApp us your prescription:** [+91-7992122974](https://wa.me/917992122974) and our pharmacist will process it within 10 minutes!`;
        }

        return NextResponse.json({
            success: true,
            response: responseText,
            medicines: foundMedicines,
            rawText: text.substring(0, 500), // First 500 chars for debug
        });

    } catch (error) {
        console.error('OCR Route Error:', error);
        return NextResponse.json({ error: 'Failed to process image. Please try again.' }, { status: 500 });
    }
}

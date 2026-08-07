import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Normalizes phone numbers to standard 10-digit Indian numbers
 * Returns null if not a valid Indian number (+91 or 10 digits starting with 6,7,8,9)
 */
function normalizeIndianPhone(rawPhone) {
    if (!rawPhone) return null;
    let cleaned = rawPhone.toString().replace(/[\s\-\(\)\+]/g, '');

    // Remove leading 91 if present
    if (cleaned.startsWith('91') && cleaned.length === 12) {
        cleaned = cleaned.substring(2);
    } else if (cleaned.startsWith('0') && cleaned.length === 11) {
        cleaned = cleaned.substring(1);
    }

    // Validate 10-digit Indian mobile number
    if (/^[6-9]\d{9}$/.test(cleaned)) {
        return cleaned;
    }
    return null;
}

/**
 * AI Name Cleaner: Removes contact tags like "Friend", "Wife Friend", "Gym", etc.
 */
function cleanContactName(rawName) {
    if (!rawName) return 'Customer';
    let name = rawName.trim();

    // Remove common phonebook tags
    name = name.replace(/\b(friend|gym|clg|college|bhabhi|aunty|uncle|office|work|sir|madam|doctor|dr|wife|hubby|flat|neighbor|roommate|society)\b/gi, '');
    name = name.replace(/[\(\)\[\]\{\}\_\-\#\*\d]/g, ' ');
    name = name.replace(/\s+/g, ' ').trim();

    if (!name || name.length < 2) return 'Customer';
    
    // Capitalize words
    return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

/**
 * POST /api/admin/customers/import
 * Accepts bulk array of contacts [{ name, phone, email, notes }]
 */
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { contacts, tag } = await req.json();
        if (!Array.isArray(contacts) || contacts.length === 0) {
            return NextResponse.json({ error: 'Contacts array is required' }, { status: 400 });
        }

        let processed = 0;
        let skippedNonIndian = 0;
        let skippedDuplicates = 0;
        const importedCustomers = [];

        // Bulk lookup existing users to avoid slow sequential DB calls
        const allPhones = contacts.map(c => normalizeIndianPhone(c.phone || c.tel || c.mobile)).filter(Boolean);
        const allEmails = allPhones.map(p => `customer_${p}@swastikmedicare.com`);

        const existingUsers = await prisma.user.findMany({
            where: {
                OR: [
                    { deviceId: { in: allPhones } },
                    { email: { in: allEmails } }
                ]
            },
            select: { deviceId: true, email: true }
        });

        const existingPhoneSet = new Set(existingUsers.map(u => u.deviceId).filter(Boolean));
        const existingEmailSet = new Set(existingUsers.map(u => u.email).filter(Boolean));

        for (const contact of contacts) {
            const rawPhone = contact.phone || contact.tel || contact.mobile;
            const validPhone = normalizeIndianPhone(rawPhone);

            if (!validPhone) {
                skippedNonIndian++;
                continue;
            }

            const cleanName = cleanContactName(contact.name || contact.fn);
            const userEmail = contact.email || `customer_${validPhone}@swastikmedicare.com`;

            if (existingPhoneSet.has(validPhone) || existingEmailSet.has(userEmail)) {
                skippedDuplicates++;
                continue;
            }

            // Temporarily mark as existing in set so duplicates within same batch are skipped
            existingPhoneSet.add(validPhone);
            existingEmailSet.add(userEmail);

            // Create Customer Account
            const newUser = await prisma.user.create({
                data: {
                    name: cleanName,
                    email: userEmail,
                    password: `swastik_${validPhone.slice(-4)}`, // Default temporary password
                    role: 'CUSTOMER',
                    isApproved: true,
                    deviceId: validPhone, // Store 10-digit mobile number
                    phoneVerified: true,
                    referredBy: tag || 'CONTACT_IMPORT'
                }
            });

            processed++;
            importedCustomers.push({
                id: newUser.id,
                name: newUser.name,
                phone: validPhone,
                email: newUser.email,
                tag: tag || 'Imported Contact'
            });
        }

        return NextResponse.json({
            success: true,
            message: `Successfully imported ${processed} Indian customer contacts! (${skippedNonIndian} non-Indian skipped, ${skippedDuplicates} existing duplicates skipped)`,
            importedCount: processed,
            skippedNonIndian,
            skippedDuplicates,
            customers: importedCustomers
        });

    } catch (error) {
        console.error('[Customer Import API Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Security utilities for data masking and session validation.
 */

/**
 * Masks a phone number (e.g., +91-78XXXXXX)
 */
export function maskPhone(phone) {
    if (!phone) return "Contact available after login";
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 5) return "****";
    // Show first 4 and last 2 digits for +91 numbers, or just mask middle
    return `+91-${clean.slice(-10, -8)}XXXXXX${clean.slice(-2)}`;
}

/**
 * Masks an email address (e.g., j***@domain.com)
 */
export function maskEmail(email) {
    if (!email) return "Email available after login";
    const [name, domain] = email.split('@');
    if (!domain) return "****";
    return `${name[0]}***@${domain}`;
}

/**
 * Strips sensitive data from profile objects based on session status
 */
export function sanitizeProfile(profile, isAuthenticated) {
    if (isAuthenticated) return profile;

    return {
        ...profile,
        phone: maskPhone(profile.phone),
        email: maskEmail(profile.email),
        website: profile.website ? "Hidden - Login to view" : null,
        address: profile.address || profile.city // Keep address/city for context
    };
}

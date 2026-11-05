/**
 * Central Mobile Number Normalization and Validation Utility
 * Swastik Medicare - Production Grade
 * 
 * Complies with MSG91 E.164 requirements and prevents MSG91 Error 202 (Invalid Mobile Number).
 */

// Common international calling code prefixes
const KNOWN_COUNTRY_CODES = [
    { code: "91", name: "India", nationalLen: 10, pattern: /^[6-9]\d{9}$/ },
    { code: "1", name: "USA/Canada", nationalLen: 10, pattern: /^\d{10}$/ },
    { code: "44", name: "UK", nationalLen: 10, pattern: /^\d{10,11}$/ },
    { code: "977", name: "Nepal", nationalLen: 10, pattern: /^9[78]\d{8}$/ },
    { code: "971", name: "UAE", nationalLen: 9, pattern: /^5\d{8}$/ },
    { code: "880", name: "Bangladesh", nationalLen: 10, pattern: /^1\d{9}$/ },
    { code: "966", name: "Saudi Arabia", nationalLen: 9, pattern: /^5\d{8}$/ },
    { code: "65", name: "Singapore", nationalLen: 8, pattern: /^[89]\d{7}$/ }
];

/**
 * Safely masks a phone number for logs and admin display (e.g. +91 95550 ****05).
 */
export function maskPhoneNumber(phone) {
    if (!phone) return "<empty>";
    const s = String(phone).trim();
    if (s.length <= 4) return "****";
    if (s.length <= 8) return s.slice(0, 2) + "****" + s.slice(-2);
    return s.slice(0, 4) + " **** " + s.slice(-2);
}

/**
 * Validates and normalizes any input phone number.
 * 
 * @param {string|number} rawInput - The user/database input.
 * @param {string} defaultCountry - Default country code if no prefix exists (defaults to "91" for India).
 * @returns {object} {
 *    isValid: boolean,
 *    e164: string,          // Digits only with country code, e.g. "919555053405" (exact format for MSG91)
 *    countryCode: string,   // e.g. "91"
 *    nationalNumber: string,// e.g. "9555053405"
 *    formatted: string,     // e.g. "+91 95550 53405"
 *    masked: string,        // e.g. "+91 95550 ****05"
 *    reason?: string        // Human-readable error reason if invalid
 * }
 */
export function normalizePhoneNumber(rawInput, defaultCountry = "91") {
    // 1. Check for null, undefined, or empty
    if (rawInput === null || rawInput === undefined) {
        return {
            isValid: false,
            reason: "Phone number is missing or undefined.",
            raw: rawInput,
            masked: "<empty>"
        };
    }

    const rawString = String(rawInput).trim();
    if (!rawString) {
        return {
            isValid: false,
            reason: "Phone number cannot be empty.",
            raw: rawString,
            masked: "<empty>"
        };
    }

    // 2. Reject obvious non-phone strings (alphabetic characters)
    if (/[a-zA-Z]/.test(rawString)) {
        return {
            isValid: false,
            reason: `Phone number contains alphabetic characters: "${maskPhoneNumber(rawString)}".`,
            raw: rawString,
            masked: maskPhoneNumber(rawString)
        };
    }

    const hasLeadingPlus = rawString.startsWith("+");
    // Remove all punctuation (spaces, dashes, parentheses, dots, slashes)
    const digitsOnly = rawString.replace(/\D/g, "");

    if (!digitsOnly || digitsOnly.length < 5) {
        return {
            isValid: false,
            reason: `Phone number is too short (${digitsOnly.length} digits): "${maskPhoneNumber(rawString)}".`,
            raw: rawString,
            masked: maskPhoneNumber(rawString)
        };
    }

    // 3. Detect Country and National Number
    let detectedCountry = defaultCountry;
    let nationalNumber = "";

    if (hasLeadingPlus) {
        // Explicit international number (+91..., +1..., +44..., etc.)
        let matched = false;
        // Check sorted by code length desc to match +977 before +97 etc.
        const sortedCodes = [...KNOWN_COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
        for (const c of sortedCodes) {
            if (digitsOnly.startsWith(c.code)) {
                detectedCountry = c.code;
                nationalNumber = digitsOnly.slice(c.code.length);
                matched = true;
                break;
            }
        }
        if (!matched) {
            // Generic international: assume first 1-3 digits are country code
            if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
                detectedCountry = digitsOnly.slice(0, 2);
                nationalNumber = digitsOnly.slice(2);
            } else {
                return {
                    isValid: false,
                    reason: `Unrecognized international country code in: "${maskPhoneNumber(rawString)}".`,
                    raw: rawString,
                    masked: maskPhoneNumber(rawString)
                };
            }
        }
    } else {
        // No leading plus. Could be:
        // A) 10-digit Indian number: 9555053405
        // B) 11-digit with trunk 0: 09555053405
        // C) 12-digit already with 91 prefix: 919555053405
        // D) Malformed 10-character starting with 0: 0963963159 (only 9 national digits!)

        if (digitsOnly.startsWith("91") && digitsOnly.length === 12) {
            // Already contains country code 91 + 10 digits
            detectedCountry = "91";
            nationalNumber = digitsOnly.slice(2);
        } else if (digitsOnly.startsWith("0")) {
            // Has trunk prefix 0
            const withoutZero = digitsOnly.replace(/^0+/, "");
            if (withoutZero.startsWith("91") && withoutZero.length === 12) {
                // e.g. 0919555053405 -> 919555053405
                detectedCountry = "91";
                nationalNumber = withoutZero.slice(2);
            } else if (withoutZero.length === 10) {
                // Standard 0 + 10-digit mobile
                detectedCountry = "91";
                nationalNumber = withoutZero;
            } else {
                // Trunk 0 removed but length is not 10 digits!
                return {
                    isValid: false,
                    reason: `Invalid length after removing trunk '0'. Expected 10 digits, found ${withoutZero.length} digits in "${maskPhoneNumber(rawString)}".`,
                    raw: rawString,
                    masked: maskPhoneNumber(rawString)
                };
            }
        } else if (digitsOnly.length === 10) {
            // Standard national 10-digit number
            detectedCountry = defaultCountry;
            nationalNumber = digitsOnly;
        } else if (digitsOnly.length === 11 && digitsOnly.startsWith("1") && defaultCountry === "1") {
            // US 1 + 10 digits
            detectedCountry = "1";
            nationalNumber = digitsOnly.slice(1);
        } else {
            return {
                isValid: false,
                reason: `Invalid digit length (${digitsOnly.length} digits). Standard mobile number must be 10 digits: "${maskPhoneNumber(rawString)}".`,
                raw: rawString,
                masked: maskPhoneNumber(rawString)
            };
        }
    }

    // 4. Validate Indian Mobile Specific Rules
    if (detectedCountry === "91") {
        if (nationalNumber.length !== 10) {
            return {
                isValid: false,
                reason: `Indian mobile number must be exactly 10 digits (found ${nationalNumber.length}): "${maskPhoneNumber(rawString)}".`,
                raw: rawString,
                masked: maskPhoneNumber(rawString)
            };
        }

        // Must start with 6, 7, 8, or 9 per TRAI National Numbering Plan
        if (!/^[6-9]/.test(nationalNumber)) {
            return {
                isValid: false,
                reason: `Indian mobile numbers must start with 6, 7, 8, or 9 (starts with '${nationalNumber[0]}'): "${maskPhoneNumber(rawString)}".`,
                raw: rawString,
                masked: maskPhoneNumber(rawString)
            };
        }
    } else {
        // Generic ITU-T E.164 check (between 7 and 15 digits total)
        const totalLen = detectedCountry.length + nationalNumber.length;
        if (totalLen < 8 || totalLen > 15) {
            return {
                isValid: false,
                reason: `Invalid international phone length (${totalLen} digits). Standard range is 8-15 digits.`,
                raw: rawString,
                masked: maskPhoneNumber(rawString)
            };
        }
    }

    // 5. Build clean E.164 without leading '+' (required by MSG91 API)
    const e164 = `${detectedCountry}${nationalNumber}`;
    const formatted = `+${detectedCountry} ${nationalNumber.slice(0, 5)} ${nationalNumber.slice(5)}`;
    const masked = `+${detectedCountry} ${nationalNumber.slice(0, 3)}****${nationalNumber.slice(-2)}`;

    return {
        isValid: true,
        e164,
        countryCode: detectedCountry,
        nationalNumber,
        formatted,
        masked
    };
}


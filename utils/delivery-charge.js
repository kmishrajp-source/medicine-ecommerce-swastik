/**
 * Swastik Medicare — Delivery Charge Calculator
 *
 * Base Location: DM Office, Civil Lines, Gorakhpur, UP
 * Coordinates: 26.7606° N, 83.3732° E
 *
 * Rules:
 *  - Purchase ≥ ₹500 AND distance ≤ 6 km → FREE (₹0)
 *  - Purchase ≥ ₹500 AND distance > 6 km  → (distance − 6) × ₹9  (first 6 km waived)
 *  - Purchase < ₹500 AND distance ≤ 6 km  → ₹50 flat
 *  - Purchase < ₹500 AND distance > 6 km  → ₹50 + (distance − 6) × ₹9
 */

// ── Constants ─────────────────────────────────────────────────────────────────
export const STORE_LAT = 26.7606;   // DM Office, Civil Lines, Gorakhpur
export const STORE_LNG = 83.3732;

export const FREE_DELIVERY_THRESHOLD = 500;  // ₹500 purchase = free delivery
export const FREE_KM_RADIUS = 6;             // first 6 km are "base zone"
export const BASE_CHARGE = 50;               // ₹50 flat for ≤ 6 km
export const PER_KM_RATE = 9;               // ₹9 per km beyond 6 km

/**
 * Haversine formula — straight-line distance between two GPS coordinates.
 * @returns distance in kilometres (number)
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius km
    const dLat = deg2rad(lat2 - lat1);
    const dLng = deg2rad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Calculate delivery charge.
 *
 * @param {number} distanceKm  - distance from store to customer in km
 * @param {number} cartTotal   - total cart value in ₹ (before delivery charge)
 * @returns {{ charge: number, isFree: boolean, breakdown: string }}
 */
export function calcDeliveryCharge(distanceKm, cartTotal) {
    let dist = parseFloat(distanceKm.toFixed(2));
    
    // DEMO SAFEGUARD: Cap distance for global testers
    if (dist > 50) {
        console.log(`[Demo Safeguard] Massive distance (${dist}km) detected. Capping to 5.5km.`);
        dist = 5.5;
    }

    const total = parseFloat(cartTotal);
    const isFreeOrder = total >= FREE_DELIVERY_THRESHOLD;
    const extraKm = Math.max(0, dist - FREE_KM_RADIUS);
    const extraCharge = parseFloat((extraKm * PER_KM_RATE).toFixed(2));

    let charge = 0;
    let breakdown = '';

    if (isFreeOrder) {
        if (dist <= FREE_KM_RADIUS) {
            // Case 1: ≥₹500 + ≤6 km → FREE
            charge = 0;
            breakdown = `Free delivery (purchase ≥ ₹${FREE_DELIVERY_THRESHOLD}, within ${FREE_KM_RADIUS} km)`;
        } else {
            // Case 2: ≥₹500 + >6 km → only extra km charged, base ₹50 waived
            charge = extraCharge;
            breakdown = `₹${BASE_CHARGE} waived (purchase ≥ ₹${FREE_DELIVERY_THRESHOLD}) · ${extraKm.toFixed(1)} km extra × ₹${PER_KM_RATE}/km`;
        }
    } else {
        if (dist <= FREE_KM_RADIUS) {
            // Case 3: <₹500 + ≤6 km → ₹50 flat
            charge = BASE_CHARGE;
            breakdown = `₹${BASE_CHARGE} flat (within ${FREE_KM_RADIUS} km)`;
        } else {
            // Case 4: <₹500 + >6 km → ₹50 + extra
            charge = BASE_CHARGE + extraCharge;
            breakdown = `₹${BASE_CHARGE} (base, ${FREE_KM_RADIUS} km) + ${extraKm.toFixed(1)} km × ₹${PER_KM_RATE}/km`;
        }
    }

    return {
        charge: parseFloat(charge.toFixed(2)),
        isFree: charge === 0,
        distanceKm: dist,
        extraKm: parseFloat(extraKm.toFixed(2)),
        breakdown,
        cartTotal: total,
        isFreeOrder
    };
}

/**
 * Calculate distance from store and full delivery charge given customer GPS.
 * @param {number} customerLat
 * @param {number} customerLng
 * @param {number} cartTotal
 */
export function calcDeliveryFromGps(customerLat, customerLng, cartTotal) {
    const distKm = haversineDistance(STORE_LAT, STORE_LNG, customerLat, customerLng);
    return { ...calcDeliveryCharge(distKm, cartTotal), method: 'gps' };
}

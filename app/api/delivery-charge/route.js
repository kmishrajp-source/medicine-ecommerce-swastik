import { NextResponse } from 'next/server';
import {
    calcDeliveryFromGps,
    calcDeliveryCharge,
    haversineDistance,
    STORE_LAT,
    STORE_LNG
} from '@/utils/delivery-charge';

/**
 * POST /api/delivery-charge
 *
 * Body (one of):
 *   { lat, lng, cartTotal }              → use GPS coordinates
 *   { address, cartTotal }               → geocode address then calculate
 *   { lat, lng, address, cartTotal }     → prefer GPS, fallback to address
 *
 * Returns:
 *   { charge, isFree, distanceKm, breakdown, method }
 */
export async function POST(req) {
    try {
        const body = await req.json();
        const { lat, lng, address, cartTotal } = body;

        if (!cartTotal && cartTotal !== 0) {
            return NextResponse.json({ error: 'cartTotal is required' }, { status: 400 });
        }

        const total = parseFloat(cartTotal);

        // ── Priority 1: GPS Coordinates ────────────────────────────────────────
        if (lat && lng) {
            const result = calcDeliveryFromGps(parseFloat(lat), parseFloat(lng), total);
            return NextResponse.json({ success: true, ...result });
        }

        // ── Priority 2: Geocode Address via Nominatim (OpenStreetMap, free) ────
        if (address) {
            try {
                // Append Gorakhpur to improve geocoding accuracy for local addresses
                const searchQuery = address.toLowerCase().includes('gorakhpur')
                    ? address
                    : `${address}, Gorakhpur, Uttar Pradesh, India`;

                const geoRes = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
                    {
                        headers: {
                            'User-Agent': 'SwastikMedicare/1.0 (contact@swastikmedicare.com)'
                        }
                    }
                );

                const geoData = await geoRes.json();

                if (geoData && geoData.length > 0) {
                    const customerLat = parseFloat(geoData[0].lat);
                    const customerLng = parseFloat(geoData[0].lon);
                    const distKm = haversineDistance(STORE_LAT, STORE_LNG, customerLat, customerLng);
                    const result = calcDeliveryCharge(distKm, total);

                    return NextResponse.json({
                        success: true,
                        ...result,
                        method: 'address_geocoded',
                        geocodedAddress: geoData[0].display_name,
                        customerLat,
                        customerLng
                    });
                } else {
                    // Geocoding failed — apply default base charge (assume within city)
                    const result = calcDeliveryCharge(4, total); // assume 4 km default
                    return NextResponse.json({
                        success: true,
                        ...result,
                        method: 'default_estimate',
                        note: 'Could not geocode address. Estimated charge for Gorakhpur city area applied.'
                    });
                }
            } catch (geoErr) {
                console.error('[Geocoding Error]', geoErr.message);
                // Fallback: assume within base zone
                const result = calcDeliveryCharge(4, total);
                return NextResponse.json({
                    success: true,
                    ...result,
                    method: 'default_estimate',
                    note: 'Geocoding failed. Default city delivery charge applied.'
                });
            }
        }

        return NextResponse.json(
            { error: 'Provide either (lat, lng) or address' },
            { status: 400 }
        );

    } catch (err) {
        console.error('[Delivery Charge API Error]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/**
 * GET /api/delivery-charge?lat=XX&lng=YY&cartTotal=ZZ
 * Quick check from frontend without a body
 */
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const cartTotal = searchParams.get('cartTotal');
    const address = searchParams.get('address');

    if (!cartTotal) {
        return NextResponse.json({ error: 'cartTotal required' }, { status: 400 });
    }

    // Re-use POST logic
    const synthetic = new Request(req.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, address, cartTotal: parseFloat(cartTotal) })
    });

    return POST(synthetic);
}

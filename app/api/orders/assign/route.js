import { createClient } from '@supabase/supabase-js'
import { sendSMS } from '@/lib/sms'

// This would normally be in a separate lib file, instantiated with env variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req) {
    try {
        const { orderId, customerLat, customerLng } = await req.json()

        if (!orderId || !customerLat || !customerLng) {
            return new Response(JSON.stringify({ error: 'Missing req parameters' }), { status: 400 })
        }

        // 1. Fetch nearest online retailers within 5km using PostGIS function
        const { data: nearbyRetailers, error: geoError } = await supabase
            .rpc('get_nearest_retailers', {
                lat: customerLat,
                lng: customerLng,
                radius_km: 5.0
            })

        if (geoError || !nearbyRetailers || nearbyRetailers.length === 0) {
            return new Response(JSON.stringify({
                error: 'No online retailers found within 5km'
            }), { status: 404 })
        }

        // 2. Select the closest retailer (or highest priority one)
        const closestRetailer = nearbyRetailers[0] // Since SQL already sorting ASC by distance

        // 3. Fetch Global Settings for dynamic timeouts
        let timeoutSeconds = 60
        const { data: settings } = await supabase.from('global_settings').select('vendor_timeout_seconds').eq('id', 1).single()
        if (settings && settings.vendor_timeout_seconds) {
            timeoutSeconds = settings.vendor_timeout_seconds
        }

        // 4. Create the Assignment Timer based on Admin Settings
        const now = new Date()
        const expiresAt = new Date(now.getTime() + (timeoutSeconds * 1000))

        const { error: assignError } = await supabase
            .from('order_assignments')
            .insert({
                order_id: orderId,
                retailer_id: closestRetailer.retailer_id,
                distance_km: closestRetailer.distance_km,
                status: 'pending',
                expires_at: expiresAt.toISOString()
            })

        if (assignError) throw assignError

        // 5. Send MSG91 or Twilio SMS to the retailer
        const { data: retailerUser } = await supabase.from('users').select('phone').eq('id', closestRetailer.retailer_id).single()
        if (retailerUser && retailerUser.phone) {
            await sendSMS(retailerUser.phone, `SWASTIK: New order received! Please accept within ${timeoutSeconds} seconds.`);
        }

        return new Response(JSON.stringify({
            message: 'Order pushed to nearest retailer',
            assigned_to: closestRetailer.store_name,
            distance: `${closestRetailer.distance_km} km`,
            expires_at: expiresAt
        }), { status: 200 })

    } catch (error) {
        console.error('API Error:', error)
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
    }
}

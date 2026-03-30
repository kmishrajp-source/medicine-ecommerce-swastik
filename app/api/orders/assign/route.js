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

        // 1. Fetch up to 3 nearest online retailers within 10km using PostGIS function
        const { data: nearbyRetailers, error: geoError } = await supabase
            .rpc('get_nearest_retailers', {
                lat: customerLat,
                lng: customerLng,
                radius_km: 10.0 // Expanded radius for broader options
            });

        if (geoError || !nearbyRetailers || nearbyRetailers.length === 0) {
            return new Response(JSON.stringify({
                error: 'No online retailers found within 10km'
            }), { status: 404 });
        }

        // Limit to 3 retailers for negotiation queue
        const topRetailers = nearbyRetailers.slice(0, 3);
        const retailerIds = topRetailers.map(r => r.retailer_id);

        // 2. Fetch System Settings for delivery fees
        const settings = await prisma.systemSettings.findFirst() || { deliveryAgentFee: 50, selfDeliveryBonus: 15 };
        const deliveryFee = settings.deliveryAgentFee;
        const totalSelfDeliveryBonus = deliveryFee + (settings.selfDeliveryBonus || 0);

        // 3. Update the Order with the negotiation queue
        await prisma.order.update({
            where: { id: orderId },
            data: {
                nearestRetailerIds: retailerIds,
                currentRetailerIndex: 0,
                deliveryFee: deliveryFee,
                assignedRetailerId: retailerIds[0],
                status: "Pending_Retailer_Acceptance"
            }
        });

        // 4. Send SMS Alert to the FIRST retailer in the queue
        const firstRetailer = topRetailers[0];
        const { data: retailerUser } = await supabase.from('users').select('phone').eq('id', firstRetailer.retailer_id).single();
        
        if (retailerUser && retailerUser.phone) {
            await sendSMS(
                retailerUser.phone, 
                `SWASTIK: New order #${orderId.slice(-6).toUpperCase()}! \n` +
                `Fulfill & Deliver yourself to earn ₹${totalSelfDeliveryBonus}? \n` +
                `Or Fulfill only for standard margin. Reply on App.`
            );
        }

        return new Response(JSON.stringify({
            message: 'Order offered to first of 3 nearest retailers',
            assigned_to: firstRetailer.store_name,
            distance: `${firstRetailer.distance_km} km`,
            retailers_in_queue: topRetailers.length
        }), { status: 200 });

    } catch (error) {
        console.error('API Error:', error)
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
    }
}

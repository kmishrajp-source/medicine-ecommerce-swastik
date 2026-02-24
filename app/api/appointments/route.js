import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req) {
    try {
        const { doctorId, patientId, consultationFee } = await req.json()

        if (!doctorId || !patientId || consultationFee === undefined) {
            return new Response(JSON.stringify({ error: 'Missing req parameters' }), { status: 400 })
        }

        // In a production application, this is where we would trigger the Razorpay/Stripe API
        // and explicitly define the `transfer_group` or `connected_account` to route 
        // 100% of the `consultationFee` directly to the Doctor's bank account, 
        // entirely bypassing the Swastik Medicare master wallet.

        // For this implementation, we log the appointment creation.

        // Create the appointment starting 1 hour from now for prototype purposes.
        const appointmentTime = new Date(new Date().getTime() + 60 * 60 * 1000)

        const { data: appointment, error } = await supabase
            .from('appointments')
            .insert({
                patient_id: patientId,
                doctor_id: doctorId,
                appointment_time: appointmentTime.toISOString(),
                status: 'confirmed',
                payment_status: 'paid', // Simulating successful payment
                payment_amount: consultationFee,
                meeting_link: `https://meet.swastikmedicare.com/${Math.random().toString(36).substring(7)}`
            })
            .select()
            .single()

        if (error) throw error

        return new Response(JSON.stringify({
            message: 'Appointment successfully created and paid.',
            appointment: appointment
        }), { status: 200 })

    } catch (error) {
        console.error('API Error:', error)
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
    }
}

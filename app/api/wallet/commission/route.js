import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
// We MUST use the service role key here because we are modifying secure financial ledgers (Wallets)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req) {
    try {
        const { orderId, customerId, medicineMarginAmount } = await req.json()

        if (!orderId || !customerId || !medicineMarginAmount) {
            return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 })
        }

        // 0. Fetch the Dynamic Commission Rates from Admin Settings
        let l1_rate = 0.05
        let l2_rate = 0.02
        const { data: globalSettings } = await supabase.from('global_settings').select('referral_level_1_percent, referral_level_2_percent').eq('id', 1).single()
        if (globalSettings) {
            l1_rate = globalSettings.referral_level_1_percent
            l2_rate = globalSettings.referral_level_2_percent
        }

        // 1. Find if this customer was referred by anyone (Level 1)
        const { data: level1Referral } = await supabase
            .from('referrals')
            .select('referrer_id')
            .eq('referred_user_id', customerId)
            .eq('level', 1)
            .single()

        if (!level1Referral) {
            return new Response(JSON.stringify({ message: 'No referrer found. No commissions paid.' }), { status: 200 })
        }

        const level1ReferrerId = level1Referral.referrer_id
        const level1Commission = medicineMarginAmount * l1_rate

        // 2. Pay Level 1 Referrer
        await creditWallet(level1ReferrerId, level1Commission, orderId, 'referral_level_1', `${l1_rate * 100}% Commission from Order ${orderId}`)

        // 3. Find if the Level 1 Referrer was referred by anyone (Level 2)
        const { data: level2Referral } = await supabase
            .from('referrals')
            .select('referrer_id')
            .eq('referred_user_id', level1ReferrerId)
            .eq('level', 1) // The person who referred the Level 1 person
            .single()

        if (level2Referral) {
            const level2ReferrerId = level2Referral.referrer_id
            const level2Commission = medicineMarginAmount * l2_rate

            // 4. Pay Level 2 Referrer
            await creditWallet(level2ReferrerId, level2Commission, orderId, 'referral_level_2', `${l2_rate * 100}% Network Commission from Order ${orderId}`)
        }

        return new Response(JSON.stringify({
            message: 'Commissions processed successfully'
        }), { status: 200 })

    } catch (error) {
        console.error('Wallet API Error:', error)
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
    }
}

// Helper function to safely increment wallet balance and log transaction (ACID compliant via RPC ideally, but doing JS for prototype)
async function creditWallet(userId, amount, orderId, type, description) {
    // A. Fetch current wallet
    let { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', userId).single()

    // Create wallet if it doesn't exist
    if (!wallet) {
        const { data: newWallet } = await supabase.from('wallets').insert({ user_id: userId, balance: 0 }).select().single()
        wallet = newWallet
    }

    // B. Insert Transaction Ledger
    const { error: txError } = await supabase.from('wallet_transactions').insert({
        wallet_id: wallet.id,
        order_id: orderId,
        transaction_type: type,
        amount: amount,
        description: description
    })
    if (txError) throw txError

    // C. Update Balance
    const newBalance = parseFloat(wallet.balance) + amount
    const { error: updateError } = await supabase.from('wallets').update({ balance: newBalance }).eq('id', wallet.id)
    if (updateError) throw updateError
}

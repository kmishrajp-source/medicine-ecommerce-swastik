'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function AdminSettings() {
    const [settings, setSettings] = useState({
        referral_level_1_percent: 0.05,
        referral_level_2_percent: 0.02,
        delivery_fee_payout: 50.00,
        vendor_timeout_seconds: 60
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        async function fetchSettings() {
            const { data, error } = await supabase
                .from('global_settings')
                .select('*')
                .eq('id', 1)
                .single()

            if (data) {
                setSettings(data)
            }
            setLoading(false)
        }

        fetchSettings()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setSettings(prev => ({ ...prev, [name]: parseFloat(value) || value }))
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setMessage('')

        const { error } = await supabase
            .from('global_settings')
            .update({
                referral_level_1_percent: settings.referral_level_1_percent,
                referral_level_2_percent: settings.referral_level_2_percent,
                delivery_fee_payout: settings.delivery_fee_payout,
                vendor_timeout_seconds: settings.vendor_timeout_seconds,
                updated_at: new Date().toISOString()
            })
            .eq('id', 1)

        setSaving(false)
        if (error) {
            console.error(error)
            setMessage('❌ Failed to update settings.')
        } else {
            setMessage('✅ Global Settings successfully updated.')
            setTimeout(() => setMessage(''), 3000)
        }
    }

    if (loading) return <div className="p-12 text-center text-gray-500">Loading Configuration...</div>

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">

                <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-bold tracking-wide">Swastik Master Dashboard</h1>
                    <p className="text-slate-400 text-sm mt-1">Configure global application variables and override system priority.</p>
                </div>

                <form onSubmit={handleSave} className="p-8 space-y-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Auto Assignment Block */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">⏱️ Routing & Assignment</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Vendor Timeout window (Seconds)</label>
                                    <input
                                        type="number"
                                        name="vendor_timeout_seconds"
                                        value={settings.vendor_timeout_seconds}
                                        onChange={handleChange}
                                        className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Amount of time before an order auto-bypasses the nearest retailer.</p>
                                </div>
                            </div>
                        </div>

                        {/* Commissions Block */}
                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm">
                            <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">💰 Global Commission Rates</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-emerald-800 mb-1">L1 Referral (% of Margin)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="referral_level_1_percent"
                                        value={settings.referral_level_1_percent}
                                        onChange={handleChange}
                                        className="w-full border border-emerald-200 rounded-lg p-3 bg-emerald-100/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-emerald-800 mb-1">L2 Referral (% of Margin)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="referral_level_2_percent"
                                        value={settings.referral_level_2_percent}
                                        onChange={handleChange}
                                        className="w-full border border-emerald-200 rounded-lg p-3 bg-emerald-100/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Logistics Block */}
                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-sm col-span-1 md:col-span-2">
                            <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">🛵 Logistics Payouts</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-indigo-800 mb-1">Delivery Agent Flat Fee (₹ INR)</label>
                                    <input
                                        type="number"
                                        step="5.00"
                                        name="delivery_fee_payout"
                                        value={settings.delivery_fee_payout}
                                        onChange={handleChange}
                                        className="w-full border border-indigo-200 rounded-lg p-3 bg-indigo-100/50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    {message && <div className={`text-center font-bold p-3 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}

                    <div className="border-t border-gray-200 pt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-full font-bold shadow-lg transition-transform hover:-translate-y-1 transform disabled:bg-slate-400"
                        >
                            {saving ? 'Saving Strategy...' : 'Update Production Settings'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}

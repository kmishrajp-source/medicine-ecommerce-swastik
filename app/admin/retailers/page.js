'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function AdminRetailers() {
    const [retailers, setRetailers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchRetailers()
    }, [])

    async function fetchRetailers() {
        const { data, error } = await supabase
            .from('retailers')
            .select('id, store_name, address, is_online, priority_score, users(phone)')
            .order('priority_score', { ascending: false })

        if (data) setRetailers(data)
        setLoading(false)
    }

    const handlePriorityUpdate = async (id, newScore) => {
        const score = parseInt(newScore) || 0
        const { error } = await supabase
            .from('retailers')
            .update({ priority_score: score })
            .eq('id', id)

        if (!error) {
            setRetailers(prev => prev.map(r => r.id === id ? { ...r, priority_score: score } : r))
        }
    }

    if (loading) return <div className="p-12 text-center text-gray-500">Loading Vendors...</div>

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">

                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Retailer Priority Management</h1>
                    <p className="text-slate-500 mt-1">Adjust priority scores to override geographic auto-routing logic.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-bold text-slate-700 uppercase tracking-wider">
                                <th className="p-4 pl-6">Store Name</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4 text-right pr-6">Priority Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {retailers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center p-8 text-slate-400">No retailers registered in the database.</td>
                                </tr>
                            ) : (
                                retailers.map((r) => (
                                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 pl-6 font-semibold text-slate-800">
                                            {r.store_name}
                                            <div className="text-xs text-slate-400 font-normal">{r.address || 'No Address Provided'}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${r.is_online ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {r.is_online ? 'ONLINE' : 'OFFLINE'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 font-medium whitespace-nowrap">
                                            {r.users?.phone || 'N/A'}
                                        </td>
                                        <td className="p-4 pr-6 flex justify-end">
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    defaultValue={r.priority_score}
                                                    onBlur={(e) => handlePriorityUpdate(r.id, e.target.value)}
                                                    className="w-24 border border-slate-300 rounded-lg p-2 text-center font-bold text-blue-700 bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                                <p className="text-[10px] text-slate-400 mt-1 absolute -bottom-4 right-0 text-right w-full">Click outside to save</p>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    )
}

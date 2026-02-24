'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function WalletDashboard() {
    const [balance, setBalance] = useState(0.00)
    const [transactions, setTransactions] = useState([])

    // Hardcoded for demonstration purposes. In production, get this from Supabase Auth session.
    const mockUserId = '00000000-0000-0000-0000-000000000001'

    useEffect(() => {
        fetchWalletData()
    }, [])

    async function fetchWalletData() {
        // 1. Fetch Wallet Balance
        const { data: wallet } = await supabase
            .from('wallets')
            .select('id, balance')
            .eq('user_id', mockUserId)
            .single()

        if (wallet) {
            setBalance(wallet.balance)

            // 2. Fetch Transaction Ledger
            const { data: txs } = await supabase
                .from('wallet_transactions')
                .select('*')
                .eq('wallet_id', wallet.id)
                .order('created_at', { ascending: false })

            if (txs) setTransactions(txs)
        }
    }

    // Helper formatting
    const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'withdrawal': return '🔻'
            case 'referral_level_1': return '🚀'
            case 'referral_level_2': return '🤝'
            case 'delivery_earning': return '🛵'
            default: return '💰'
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Earnings Wallet</h1>
                    <p className="text-gray-500 mt-1">Track your referral commissions and delivery payouts.</p>
                </div>

                {/* Balance Card */}
                <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-20 text-9xl">₹</div>
                    <p className="text-green-100 font-medium tracking-wide uppercase text-sm">Available Balance</p>
                    <h2 className="text-5xl font-extrabold mt-2 tracking-tight">{formatINR(balance)}</h2>

                    <div className="mt-8 flex gap-4">
                        <button className="bg-white text-teal-700 px-6 py-3 rounded-full font-semibold shadow hover:bg-green-50 transition-colors">
                            Withdraw to Bank
                        </button>
                        <button className="bg-teal-700 bg-opacity-50 text-white px-6 py-3 rounded-full font-semibold hover:bg-opacity-70 transition-colors">
                            View Referral Code
                        </button>
                    </div>
                </div>

                {/* Transactions Ledger */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {transactions.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">No transactions yet. Start referring!</div>
                        ) : (
                            transactions.map((tx) => (
                                <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-xl shadow-sm border border-green-100">
                                            {getTransactionIcon(tx.transaction_type)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{tx.description}</p>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`font-bold text-lg ${tx.transaction_type === 'withdrawal' ? 'text-red-500' : 'text-green-600'}`}>
                                            {tx.transaction_type === 'withdrawal' ? '-' : '+'}{formatINR(tx.amount)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

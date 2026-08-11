"use client";
import { useState, useEffect } from "react";
import { TrendingUp, Package, CheckCircle, Clock, ShieldCheck, IndianRupee, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function RetailerSettlementOverview() {
    // Mock data for now until API is ready
    const [stats, setStats] = useState({
        today: {
            received: 18,
            accepted: 16,
            packed: 14,
            dispatched: 12,
            delivered: 10,
            cancelled: 2
        },
        money: {
            sales: 14250,
            gross: 12825,
            commission: 1425,
            delivery: 0,
            refunds: 0,
            adjustments: 0,
            pendingSettlement: 8450,
            availableSettlement: 4375,
            paidSettlement: 92450
        },
        nextSettlement: {
            amount: 6800,
            date: "2026-08-14",
            status: "PROCESSING",
            reference: "STL-2026-042"
        },
        trust: {
            verification: "VERIFIED",
            kyc: "APPROVED",
            licence: "VERIFIED",
            bank: "VERIFIED",
            settlement: "ACTIVE",
            riskLevel: "LOW"
        }
    });

    return (
        <div className="space-y-6">
            {/* Trust Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-2xl p-6 text-white flex justify-between items-center shadow-lg">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="w-8 h-8 text-blue-300" />
                        Swastik Trusted Retailer
                    </h2>
                    <p className="text-blue-100 mt-2">Your settlement is transparent. Track every eligible order from fulfilment to settlement.</p>
                </div>
                <div className="hidden md:flex gap-4">
                    <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 text-center">
                        <p className="text-xs text-blue-200">Trust Level</p>
                        <p className="font-bold text-lg text-green-300">{stats.trust.verification}</p>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 text-center">
                        <p className="text-xs text-blue-200">Risk Profile</p>
                        <p className="font-bold text-lg text-green-300">{stats.trust.riskLevel}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Today's Operations */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-indigo-600" />
                        Today's Operations
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-500 font-medium">Received</p>
                            <p className="text-xl font-bold text-slate-800">{stats.today.received}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-600 font-medium">Accepted</p>
                            <p className="text-xl font-bold text-blue-800">{stats.today.accepted}</p>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                            <p className="text-xs text-amber-600 font-medium">Packed / Dispatched</p>
                            <p className="text-xl font-bold text-amber-800">{stats.today.packed} / {stats.today.dispatched}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                            <p className="text-xs text-green-600 font-medium">Delivered</p>
                            <p className="text-xl font-bold text-green-800">{stats.today.delivered}</p>
                        </div>
                    </div>
                </div>

                {/* Financial Ledger Overview */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            Financial Ledger Overview
                        </h3>
                        <Link href="/retailer/settlements" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                            View Ledger <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                            <p className="text-xs text-gray-500">Today's Total Sales</p>
                            <p className="font-bold text-gray-900">₹{stats.money.sales}</p>
                        </div>
                        <div>
                            <p className="text-xs text-red-500">Platform Commission</p>
                            <p className="font-bold text-red-600">- ₹{stats.money.commission}</p>
                        </div>
                        <div>
                            <p className="text-xs text-amber-500">Pending Settlement</p>
                            <p className="font-bold text-amber-600">₹{stats.money.pendingSettlement}</p>
                        </div>
                        <div>
                            <p className="text-xs text-green-600">Paid (All Time)</p>
                            <p className="font-bold text-green-700">₹{stats.money.paidSettlement}</p>
                        </div>
                    </div>

                    {/* Next Settlement Widget */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200">
                                <IndianRupee className="w-6 h-6 text-slate-700" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Next Settlement</p>
                                <p className="text-xl font-black text-slate-800">₹{stats.nextSettlement.amount}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <div>
                                <p className="text-slate-500 text-xs">Expected Date</p>
                                <p className="font-bold text-slate-700">{new Date(stats.nextSettlement.date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">Status</p>
                                <p className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs mt-0.5">{stats.nextSettlement.status}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function ArrowUpRight({ className }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
    )
}

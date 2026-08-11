"use client";
import { useState, useEffect } from "react";
import { TrendingUp, Package, CheckCircle, Clock, ShieldCheck, IndianRupee, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function RetailerSettlementOverview() {
    const [loading, setLoading] = useState(true);
    const [trustData, setTrustData] = useState(null);
    const [accepting, setAccepting] = useState(false);

    // Keeping mock stats for the financial part until Phase 5 or when the full API is wired
    const [stats] = useState({
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
            commission: 1425,
            pendingSettlement: 8450,
            paidSettlement: 92450
        },
        nextSettlement: {
            amount: 6800,
            date: "2026-08-14",
            status: "PROCESSING",
        }
    });

    useEffect(() => {
        fetchTrustData();
    }, []);

    const fetchTrustData = async () => {
        try {
            const res = await fetch("/api/retailer/trust");
            const data = await res.json();
            if (data.success) {
                setTrustData(data.trust);
            }
        } catch (error) {
            console.error("Failed to fetch trust data", error);
        }
        setLoading(false);
    };

    const handleAcceptAgreement = async () => {
        setAccepting(true);
        try {
            const res = await fetch("/api/retailer/trust", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ version: "1.0", ipAddress: "client-ip" })
            });
            const data = await res.json();
            if (data.success) {
                alert("Agreement Accepted Successfully. Your settlement account is now active.");
                fetchTrustData();
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert("Failed to accept agreement");
        }
        setAccepting(false);
    };

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Financial Profile...</div>;

    const isHighRisk = trustData?.riskLevel === 'HIGH';
    const missingAgreement = trustData && !trustData.hasAcceptedAgreement;

    return (
        <div className="space-y-6">
            {/* Agreement Blocker */}
            {missingAgreement && (
                <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                            <AlertCircle className="w-6 h-6" />
                            Action Required: Partner Agreement
                        </h2>
                        <p className="text-amber-800 mt-2 max-w-2xl">
                            Before processing your payouts, you must accept the Swastik Medicare Pharmacy Partner Agreement. 
                            This covers settlement cycles, platform commissions, and COD reconciliation terms.
                        </p>
                        <div className="mt-4 p-4 bg-white rounded-xl border border-amber-200 h-40 overflow-y-auto text-sm text-gray-700">
                            <strong>Retailer Trust & Settlement Agreement (v1.0)</strong><br/><br/>
                            1. The Retailer agrees to fulfill all accepted orders strictly according to the prescription.<br/>
                            2. <strong>Settlement Cycle:</strong> Eligible prepaid transactions will be batched and processed to the Retailer's verified bank account after applying the agreed platform service fee.<br/>
                            3. <strong>Cash On Delivery (COD):</strong> If the retailer collects cash directly, the platform service fee for those orders will be deducted from their future prepaid payouts. If the negative balance exceeds threshold, the retailer must deposit the difference to the platform.<br/>
                            4. <strong>Tamper Seals:</strong> The Retailer must apply Swastik-provided tamper-evident seals to all packages. Failure to do so voids protection against transit disputes.<br/>
                            5. <strong>Returns/Refunds:</strong> If a valid return is initiated by the customer due to wrong/expired medicine, the settlement for that order will be reversed.<br/><br/>
                            <em>By clicking Accept, you electronically sign this legally binding agreement.</em>
                        </div>
                        <button 
                            onClick={handleAcceptAgreement}
                            disabled={accepting}
                            className="mt-4 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                        >
                            {accepting ? "Signing..." : "I Accept the Partner Agreement"}
                        </button>
                    </div>
                </div>
            )}

            {/* Trust Banner */}
            <div className={`bg-gradient-to-r rounded-2xl p-6 text-white flex justify-between items-center shadow-lg ${
                isHighRisk ? 'from-red-900 to-orange-800' : 'from-blue-900 to-indigo-800'
            }`}>
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        {isHighRisk ? <AlertCircle className="w-8 h-8 text-red-300" /> : <ShieldCheck className="w-8 h-8 text-blue-300" />}
                        {isHighRisk ? "Action Required: High Risk Profile" : "Swastik Trusted Retailer"}
                    </h2>
                    <p className={isHighRisk ? "text-red-100 mt-2" : "text-blue-100 mt-2"}>
                        {trustData?.riskReason || "Your settlement is transparent. Track every eligible order from fulfilment to settlement."}
                    </p>
                </div>
                <div className="hidden md:flex gap-4">
                    <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 text-center">
                        <p className="text-xs text-white/70">Trust Level</p>
                        <p className={`font-bold text-lg ${trustData?.verification === 'VERIFIED' ? 'text-green-300' : 'text-amber-300'}`}>
                            {trustData?.verification || 'PENDING'}
                        </p>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 text-center">
                        <p className="text-xs text-white/70">Risk Profile</p>
                        <p className={`font-bold text-lg ${
                            trustData?.riskLevel === 'LOW' ? 'text-green-300' : 
                            trustData?.riskLevel === 'MEDIUM' ? 'text-amber-300' : 'text-red-300'
                        }`}>
                            {trustData?.riskLevel || 'UNKNOWN'}
                        </p>
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

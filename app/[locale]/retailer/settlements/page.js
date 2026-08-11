"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Download, FileText, CheckCircle, Clock, AlertCircle, TrendingUp, IndianRupee } from "lucide-react";
import Link from "next/link";

export default function RetailerSettlements() {
    const [ledger, setLedger] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLedger();
    }, []);

    const fetchLedger = async () => {
        try {
            const res = await fetch("/api/retailer/settlements");
            const data = await res.json();
            if (data.success) {
                setLedger(data.ledger);
                setSummary(data.summary);
            }
        } catch (error) {
            console.error("Failed to fetch settlements", error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar cartCount={0} />

            <div className="container mx-auto px-4 py-8" style={{ marginTop: "80px", maxWidth: "1200px" }}>
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <Link href="/retailer/dashboard" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-2">
                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Settlement Ledger</h1>
                        <p className="text-gray-500 text-sm">Full history of your payouts, commissions, and adjustments.</p>
                    </div>

                    <a
                        href="/api/admin/settlements/export"
                        download
                        className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </a>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Eligible (Unbatched)</p>
                            <p className="text-2xl font-black text-indigo-600 mt-1 flex items-center gap-1">
                                <IndianRupee className="w-5 h-5" />{summary.totalEligible}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Orders fulfilled, awaiting batch</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                            <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider">In Processing</p>
                            <p className="text-2xl font-black text-amber-600 mt-1 flex items-center gap-1">
                                <IndianRupee className="w-5 h-5" />{summary.totalPending}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Batched, transfer in progress</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                            <p className="text-xs text-green-600 font-semibold uppercase tracking-wider">Total Paid (All Time)</p>
                            <p className="text-2xl font-black text-green-600 mt-1 flex items-center gap-1">
                                <IndianRupee className="w-5 h-5" />{summary.totalPaid}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Successfully transferred to bank</p>
                        </div>
                    </div>
                )}

                {/* Ledger Table */}
                {loading ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 animate-pulse">
                        Loading your settlement ledger...
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                                        <th className="p-4 font-semibold">Settlement / Batch ID</th>
                                        <th className="p-4 font-semibold">Date</th>
                                        <th className="p-4 font-semibold text-right">Orders</th>
                                        <th className="p-4 font-semibold text-right">Gross Sales</th>
                                        <th className="p-4 font-semibold text-right text-red-500">Commission</th>
                                        <th className="p-4 font-semibold text-right text-blue-600">Net Payout</th>
                                        <th className="p-4 font-semibold text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ledger.map((entry) => (
                                        <tr key={entry.batchRef} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                                                    <span className="font-bold text-gray-900 text-sm">{entry.batchRef}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-600 text-sm">
                                                {new Date(entry.date).toLocaleDateString('en-IN')}
                                            </td>
                                            <td className="p-4 text-right font-medium text-gray-700">{entry.orderCount}</td>
                                            <td className="p-4 text-right text-gray-700 font-medium">₹{entry.grossAmount.toFixed(2)}</td>
                                            <td className="p-4 text-right text-red-600 font-medium">-₹{entry.commission.toFixed(2)}</td>
                                            <td className="p-4 text-right font-bold text-green-700">₹{entry.netAmount.toFixed(2)}</td>
                                            <td className="p-4 text-center">
                                                {entry.status === 'PAID' ? (
                                                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold">
                                                        <CheckCircle className="w-3 h-3" /> PAID
                                                    </span>
                                                ) : entry.status === 'PROCESSING' || entry.status === 'IN_BATCH' ? (
                                                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold">
                                                        <Clock className="w-3 h-3" /> PROCESSING
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold">
                                                        <TrendingUp className="w-3 h-3" /> ELIGIBLE
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {ledger.length === 0 && (
                            <div className="p-12 text-center text-gray-400">
                                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p className="font-semibold">No settlement history found.</p>
                                <p className="text-sm mt-1">Start fulfilling orders to build your ledger.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Legal Notice */}
                <div className="mt-6 bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                        <strong>Important:</strong> All settlement amounts are subject to your Partner Agreement, applicable commissions, returns, and COD reconciliation deductions. 
                        For disputes, contact <a href="/support" className="underline font-bold">Swastik Medicare Support</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}

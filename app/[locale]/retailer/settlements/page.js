"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Download, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function RetailerSettlements() {
    // Mock data until API is built
    const [settlements] = useState([
        {
            id: "STL-2026-042",
            date: "2026-08-14",
            orderCount: 45,
            gross: 42500,
            commission: 4250,
            refunds: 500,
            adjustments: 0,
            net: 37750,
            status: "PROCESSING"
        },
        {
            id: "STL-2026-041",
            date: "2026-08-07",
            orderCount: 52,
            gross: 48000,
            commission: 4800,
            refunds: 0,
            adjustments: 200,
            net: 43400,
            status: "PAID"
        },
        {
            id: "STL-2026-040",
            date: "2026-07-31",
            orderCount: 38,
            gross: 36000,
            commission: 3600,
            refunds: 1200,
            adjustments: 0,
            net: 31200,
            status: "PAID"
        }
    ]);

    const handleExport = () => {
        alert("Accounting export will be available once the backend API is connected.");
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
                        <p className="text-gray-500 text-sm">Track your payouts, commissions, and adjustments.</p>
                    </div>
                    
                    <button 
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>

                {/* Ledger Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                                    <th className="p-4 font-semibold">Settlement ID</th>
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold text-right">Orders</th>
                                    <th className="p-4 font-semibold text-right">Gross Sales</th>
                                    <th className="p-4 font-semibold text-right text-red-500">Commission</th>
                                    <th className="p-4 font-semibold text-right text-red-500">Refunds</th>
                                    <th className="p-4 font-semibold text-right text-blue-600">Net Payout</th>
                                    <th className="p-4 font-semibold text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {settlements.map((s) => (
                                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-400" />
                                                <span className="font-bold text-gray-900">{s.id}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600">{new Date(s.date).toLocaleDateString()}</td>
                                        <td className="p-4 text-right font-medium text-gray-700">{s.orderCount}</td>
                                        <td className="p-4 text-right text-gray-700 font-medium">₹{s.gross.toLocaleString()}</td>
                                        <td className="p-4 text-right text-red-600 font-medium">-₹{s.commission.toLocaleString()}</td>
                                        <td className="p-4 text-right text-red-600 font-medium">-₹{s.refunds.toLocaleString()}</td>
                                        <td className="p-4 text-right font-bold text-green-700">₹{s.net.toLocaleString()}</td>
                                        <td className="p-4 text-center">
                                            {s.status === 'PAID' ? (
                                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold">
                                                    <CheckCircle className="w-3 h-3" /> PAID
                                                </span>
                                            ) : s.status === 'PROCESSING' ? (
                                                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold">
                                                    <Clock className="w-3 h-3" /> PROCESSING
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold">
                                                    <AlertCircle className="w-3 h-3" /> {s.status}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {settlements.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No settlement history found.
                        </div>
                    )}
                </div>
                
                {/* Information Notice */}
                <div className="mt-6 bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                        <strong>Important:</strong> Eligible completed transactions are settled according to your Retailer Agreement and applicable settlement rules, subject to cancellations, refunds, returns, disputes, chargebacks, reconciliation and applicable deductions.
                    </p>
                </div>
            </div>
        </div>
    );
}

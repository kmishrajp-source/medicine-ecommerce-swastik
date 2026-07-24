"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CompetitorBillsAdmin() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            router.push("/");
        }
    }, [status]);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const res = await fetch("/api/admin/competitor-bills");
            const data = await res.json();
            if (data.success) {
                setBills(data.bills);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            const res = await fetch("/api/admin/competitor-bills", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, action })
            });
            const data = await res.json();
            if (data.success) {
                fetchBills(); // Refresh list
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (status === "loading" || loading) return <div className="p-10 text-center font-bold text-slate-500">Loading Module...</div>;

    return (
        <div className="bg-[#0f172a] min-h-screen pb-20 text-slate-200">
            <div className="bg-[#1e293b] border-b border-slate-700 px-8 py-10 mb-8 shadow-xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 flex items-center">
                            <i className="fa-solid fa-file-invoice text-indigo-400 mr-3"></i>
                            Competitor Switch Campaigns
                        </h1>
                        <p className="text-indigo-400/80 font-bold uppercase tracking-widest text-[10px]">
                            Review Uploaded Amazon/1mg Bills & Issue Cashback
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8">
                <div className="bg-[#1e293b] rounded-3xl border border-slate-700 shadow-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800 text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-700">
                                <th className="p-4 font-black">Date</th>
                                <th className="p-4 font-black">Competitor</th>
                                <th className="p-4 font-black">Contact (Phone)</th>
                                <th className="p-4 font-black">Bill Screenshot</th>
                                <th className="p-4 font-black">Status & Coupon</th>
                                <th className="p-4 font-black">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map((bill) => (
                                <tr key={bill.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-all">
                                    <td className="p-4 font-bold text-sm">{new Date(bill.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 font-black text-white">
                                        {bill.competitorName === "Amazon Pharmacy" ? (
                                            <span className="text-orange-400"><i className="fa-brands fa-amazon mr-1"></i> Amazon</span>
                                        ) : bill.competitorName}
                                    </td>
                                    <td className="p-4 font-medium text-sm">{bill.phone || bill.userId || "N/A"}</td>
                                    <td className="p-4">
                                        <a href={bill.imageUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 font-bold text-xs flex items-center gap-1">
                                            <i className="fa-solid fa-up-right-from-square"></i> View Image
                                        </a>
                                    </td>
                                    <td className="p-4">
                                        {bill.status === "PENDING" && <span className="bg-amber-500/20 text-amber-500 px-2 py-1 rounded text-xs font-black">PENDING</span>}
                                        {bill.status === "REJECTED" && <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-xs font-black">REJECTED</span>}
                                        {bill.status === "APPROVED" && (
                                            <div className="flex flex-col gap-1">
                                                <span className="bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded text-xs font-black w-max">APPROVED</span>
                                                <span className="text-[10px] font-bold text-slate-400 font-mono">{bill.couponCode}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        {bill.status === "PENDING" && (
                                            <>
                                                <button 
                                                    onClick={() => handleAction(bill.id, "APPROVE")}
                                                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-3 py-1 rounded text-xs font-black uppercase"
                                                >
                                                    Approve & Issue ₹100
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(bill.id, "REJECT")}
                                                    className="bg-red-500/20 hover:bg-red-500 hover:text-white text-red-500 px-3 py-1 rounded text-xs font-black uppercase transition-all"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {bills.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500 font-bold">No competitor bills uploaded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

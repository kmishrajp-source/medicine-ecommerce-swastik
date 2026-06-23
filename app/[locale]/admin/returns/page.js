"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";

const STATUS_CONFIG = {
    "Pending":      { color: "bg-amber-50 text-amber-700 border-amber-200",       icon: "fa-clock",         label: "Pending" },
    "Under_Review": { color: "bg-blue-50 text-blue-700 border-blue-200",          icon: "fa-magnifying-glass", label: "Under Review" },
    "Approved":     { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "fa-circle-check",  label: "Approved" },
    "Rejected":     { color: "bg-rose-50 text-rose-700 border-rose-200",          icon: "fa-circle-xmark",  label: "Rejected" },
    "Refunded":     { color: "bg-purple-50 text-purple-700 border-purple-200",    icon: "fa-rotate-left",   label: "Refunded" },
};

const REASON_MAP = {
    wrong_product: "Wrong Product Delivered",
    damaged_product: "Product Arrived Damaged",
    delivery_error: "Delivery Error / Missing Item",
};

export default function AdminReturnsPage() {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [selected, setSelected] = useState(null);
    const [actionStage, setActionStage] = useState(""); // cs, pharmacist, ops
    const [decision, setDecision] = useState("");
    const [notes, setNotes] = useState("");
    const [refundAmount, setRefundAmount] = useState("");
    const [refundMethod, setRefundMethod] = useState("wallet");
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const fetchReturns = async () => {
        setLoading(true);
        try {
            const url = statusFilter ? `/api/admin/returns?status=${statusFilter}` : `/api/admin/returns`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) setReturns(data.returns);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReturns(); }, [statusFilter]);

    const handleAction = async () => {
        setSubmitting(true);
        setErrorMsg("");
        setSuccessMsg("");
        try {
            const res = await fetch("/api/admin/returns", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    returnId: selected.id,
                    stage: actionStage,
                    decision,
                    notes,
                    refundAmount: parseFloat(refundAmount) || 0,
                    refundMethod,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMsg("Action recorded successfully!");
                setSelected(null);
                setActionStage("");
                setDecision("");
                setNotes("");
                fetchReturns();
            } else {
                setErrorMsg(data.error || "Failed to process action.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar activeItem="returns" />

            <main className="flex-1 p-8 ml-64">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 mb-1">Returns & Refunds</h1>
                                <p className="text-slate-500 font-medium text-sm">SOP Chapter 14: Multi-level approval workflow</p>
                            </div>
                            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black px-4 py-2 rounded-xl">
                                <i className="fa-solid fa-shield-halved"></i>
                                CS → Pharmacist → Ops Manager
                            </div>
                        </div>
                    </div>

                    {/* Filter bar */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {["", "Pending", "Under_Review", "Approved", "Rejected", "Refunded"].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${statusFilter === s ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"}`}
                            >
                                {s === "" ? "All" : s.replace("_", " ")}
                            </button>
                        ))}
                    </div>

                    {successMsg && (
                        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                            <i className="fa-solid fa-circle-check text-emerald-500"></i>
                            <p className="text-emerald-700 font-bold text-sm">{successMsg}</p>
                        </div>
                    )}

                    {/* Returns List */}
                    {loading ? (
                        <div className="py-20 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-slate-300"></i></div>
                    ) : returns.length === 0 ? (
                        <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-100 shadow-sm">
                            <i className="fa-solid fa-box-open text-5xl text-slate-200 mb-4"></i>
                            <p className="font-black text-slate-400 text-xl">No returns found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {returns.map(ret => {
                                const cfg = STATUS_CONFIG[ret.status] || STATUS_CONFIG["Pending"];
                                const customer = ret.order?.user?.name || ret.guestName || "Guest";
                                const phone = ret.guestPhone || "—";

                                return (
                                    <div key={ret.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${cfg.color}`}>
                                                        <i className={`fa-solid ${cfg.icon} text-[9px]`}></i> {cfg.label}
                                                    </span>
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                        #{ret.id.slice(-8).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-3">
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                                                        <p className="font-black text-slate-900 text-sm">{customer}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Order ID</p>
                                                        <p className="font-mono text-sm text-indigo-600 font-bold">#{ret.orderId.slice(-10).toUpperCase()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reason</p>
                                                        <p className="font-bold text-slate-700 text-sm">{REASON_MAP[ret.reason] || ret.reason}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Submitted</p>
                                                        <p className="font-bold text-slate-700 text-sm">{new Date(ret.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium line-clamp-2 bg-slate-50 p-3 rounded-xl">{ret.description}</p>

                                                {/* Approval Chain Progress */}
                                                <div className="flex gap-3 mt-4">
                                                    {[
                                                        { label: "CS Team", val: ret.csApproval },
                                                        { label: "Pharmacist", val: ret.pharmacistApproval },
                                                        { label: "Ops Manager", val: ret.opsApproval },
                                                    ].map((step, i) => (
                                                        <div key={i} className="flex items-center gap-2">
                                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] ${step.val === "approved" ? "bg-emerald-100 text-emerald-600" : step.val === "rejected" ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"}`}>
                                                                <i className={`fa-solid ${step.val === "approved" ? "fa-check" : step.val === "rejected" ? "fa-xmark" : "fa-ellipsis"}`}></i>
                                                            </div>
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{step.label}</span>
                                                            {i < 2 && <i className="fa-solid fa-arrow-right text-slate-200 text-[9px]"></i>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            {ret.status !== "Approved" && ret.status !== "Rejected" && ret.status !== "Refunded" && (
                                                <button
                                                    onClick={() => { setSelected(ret); setActionStage(""); setDecision(""); setNotes(""); setRefundAmount(ret.order?.total?.toString() || ""); }}
                                                    className="shrink-0 bg-indigo-600 text-white font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
                                                >
                                                    <i className="fa-solid fa-gavel"></i> Take Action
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Action Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-900">Process Return #{selected.id.slice(-8).toUpperCase()}</h2>
                            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-all">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <p className="text-sm font-medium text-slate-500 mb-6 bg-slate-50 p-4 rounded-2xl">{selected.description}</p>

                        {/* Stage Selection */}
                        <div className="mb-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Your Role / Stage *</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { val: "cs", label: "CS Team", icon: "fa-headset" },
                                    { val: "pharmacist", label: "Pharmacist", icon: "fa-pills" },
                                    { val: "ops", label: "Ops Manager", icon: "fa-briefcase" },
                                ].map(s => (
                                    <button key={s.val} type="button" onClick={() => setActionStage(s.val)}
                                        className={`p-3 rounded-2xl border-2 text-center transition-all ${actionStage === s.val ? "border-indigo-400 bg-indigo-50" : "border-slate-100 hover:border-slate-200"}`}
                                    >
                                        <i className={`fa-solid ${s.icon} text-${actionStage === s.val ? "indigo" : "slate"}-500 block mb-1`}></i>
                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{s.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Decision */}
                        <div className="mb-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Decision *</label>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setDecision("approved")} className={`flex-1 py-3 rounded-2xl border-2 font-black text-sm transition-all flex items-center justify-center gap-2 ${decision === "approved" ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-slate-100 text-slate-500 hover:border-emerald-200"}`}>
                                    <i className="fa-solid fa-thumbs-up"></i> Approve
                                </button>
                                <button type="button" onClick={() => setDecision("rejected")} className={`flex-1 py-3 rounded-2xl border-2 font-black text-sm transition-all flex items-center justify-center gap-2 ${decision === "rejected" ? "border-rose-400 bg-rose-50 text-rose-700" : "border-slate-100 text-slate-500 hover:border-rose-200"}`}>
                                    <i className="fa-solid fa-thumbs-down"></i> Reject
                                </button>
                            </div>
                        </div>

                        {/* Ops-specific fields */}
                        {actionStage === "ops" && decision === "approved" && (
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Refund Amount (₹)</label>
                                    <input type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 text-sm outline-none focus:border-indigo-300" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Refund Method</label>
                                    <select value={refundMethod} onChange={e => setRefundMethod(e.target.value)} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-900 text-sm outline-none focus:border-indigo-300">
                                        <option value="wallet">Wallet Credit</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="upi">UPI</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        <div className="mb-6">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Notes / Remarks</label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                rows={3}
                                placeholder="Add any internal notes..."
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-medium text-slate-900 text-sm outline-none focus:border-indigo-300 resize-none"
                            />
                        </div>

                        {errorMsg && (
                            <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-700 font-bold text-sm flex items-center gap-2">
                                <i className="fa-solid fa-triangle-exclamation"></i> {errorMsg}
                            </div>
                        )}

                        <button
                            onClick={handleAction}
                            disabled={submitting || !actionStage || !decision}
                            className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? <><i className="fa-solid fa-spinner fa-spin"></i> Processing...</> : <><i className="fa-solid fa-gavel"></i> Confirm Action</>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

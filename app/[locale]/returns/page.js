"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

const RETURN_REASONS = [
    { value: "wrong_product", label: "Wrong Product Delivered", icon: "fa-box-open" },
    { value: "damaged_product", label: "Product Arrived Damaged", icon: "fa-heart-crack" },
    { value: "delivery_error", label: "Delivery Error / Missing Item", icon: "fa-truck-arrow-right" },
];

const STATUS_CONFIG = {
    "Pending":      { color: "bg-amber-50 text-amber-700 border-amber-200",    icon: "fa-clock",        label: "Pending Review" },
    "Under_Review": { color: "bg-blue-50 text-blue-700 border-blue-200",       icon: "fa-magnifying-glass", label: "Under Review" },
    "Approved":     { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "fa-circle-check",  label: "Approved" },
    "Rejected":     { color: "bg-rose-50 text-rose-700 border-rose-200",       icon: "fa-circle-xmark",  label: "Rejected" },
    "Refunded":     { color: "bg-purple-50 text-purple-700 border-purple-200", icon: "fa-rotate-left",   label: "Refunded" },
};

export default function ReturnsPage() {
    const { data: session } = useSession();
    const { cartCount, toggleCart } = useCart();
    const [tab, setTab] = useState("new"); // "new" | "history"
    const [orderId, setOrderId] = useState("");
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [guestName, setGuestName] = useState("");
    const [guestPhone, setGuestPhone] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [returns, setReturns] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (tab === "history" && session) {
            setLoadingHistory(true);
            fetch("/api/returns")
                .then(r => r.json())
                .then(d => { if (d.success) setReturns(d.returns); })
                .finally(() => setLoadingHistory(false));
        }
    }, [tab, session]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const res = await fetch("/api/returns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, reason, description, guestName: guestName || undefined, guestPhone: guestPhone || undefined }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.error || "Failed to submit. Please try again.");
            } else {
                setSubmitted(true);
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
                {/* Header */}
                <div className="mb-10">
                    <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                        <i className="fa-solid fa-rotate-left"></i> Returns & Refunds
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Return Request Portal</h1>
                    <p className="text-slate-500 font-medium">Submit a return for wrong or damaged products. Our team reviews every request.</p>
                </div>

                {/* Policy Banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex gap-4 items-start">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-circle-info"></i>
                    </div>
                    <div>
                        <p className="font-black text-amber-900 text-sm mb-1">Return Policy (As per SOP)</p>
                        <ul className="text-xs text-amber-700 font-medium space-y-1">
                            <li><i className="fa-solid fa-check mr-2 text-emerald-500"></i>Wrong product delivered ✔</li>
                            <li><i className="fa-solid fa-check mr-2 text-emerald-500"></i>Damaged product received ✔</li>
                            <li><i className="fa-solid fa-check mr-2 text-emerald-500"></i>Delivery error / missing items ✔</li>
                            <li><i className="fa-solid fa-xmark mr-2 text-rose-500"></i>Opened or used medicines ✗</li>
                            <li><i className="fa-solid fa-xmark mr-2 text-rose-500"></i>Returns after 48 hours of delivery ✗</li>
                        </ul>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm">
                    <button
                        onClick={() => setTab("new")}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === "new" ? "bg-rose-600 text-white shadow-lg shadow-rose-100" : "text-slate-400 hover:text-slate-700"}`}
                    >
                        <i className="fa-solid fa-plus mr-2"></i>New Request
                    </button>
                    <button
                        onClick={() => setTab("history")}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === "history" ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-400 hover:text-slate-700"}`}
                    >
                        <i className="fa-solid fa-clock-rotate-left mr-2"></i>My Returns
                    </button>
                </div>

                {/* New Return Request Form */}
                {tab === "new" && (
                    submitted ? (
                        <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100 shadow-sm">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-[2rem] flex items-center justify-center text-3xl mb-6 mx-auto">
                                <i className="fa-solid fa-paper-plane"></i>
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-3">Return Request Submitted!</h2>
                            <p className="text-slate-500 font-medium mb-2">Your request has been registered. Our Customer Service team will review it within <strong>4 hours</strong>.</p>
                            <p className="text-slate-400 text-sm mb-8">You will be notified via WhatsApp once a decision is made.</p>
                            <button onClick={() => { setSubmitted(false); setOrderId(""); setReason(""); setDescription(""); }} className="bg-rose-600 text-white font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-rose-700 transition-all">
                                Submit Another
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                            {/* Order ID */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Order ID *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. cm123abc..."
                                    value={orderId}
                                    onChange={e => setOrderId(e.target.value)}
                                    required
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all outline-none text-sm"
                                />
                                <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Find your Order ID in your order confirmation or account history.</p>
                            </div>

                            {/* Guest fields for non-logged in users */}
                            {!session && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Your Name *</label>
                                        <input type="text" placeholder="Full name" value={guestName} onChange={e => setGuestName(e.target.value)} required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Phone Number *</label>
                                        <input type="tel" placeholder="+91..." value={guestPhone} onChange={e => setGuestPhone(e.target.value)} required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all outline-none text-sm" />
                                    </div>
                                </div>
                            )}

                            {/* Reason */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Reason for Return *</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {RETURN_REASONS.map(r => (
                                        <button
                                            type="button"
                                            key={r.value}
                                            onClick={() => setReason(r.value)}
                                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${reason === r.value ? "border-rose-400 bg-rose-50" : "border-slate-100 bg-slate-50 hover:border-slate-200"}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${reason === r.value ? "bg-rose-100 text-rose-600" : "bg-white text-slate-400"}`}>
                                                <i className={`fa-solid ${r.icon}`}></i>
                                            </div>
                                            <span className={`font-black text-sm ${reason === r.value ? "text-rose-700" : "text-slate-700"}`}>{r.label}</span>
                                            {reason === r.value && <i className="fa-solid fa-circle-check text-rose-500 ml-auto"></i>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Describe the Issue *</label>
                                <textarea
                                    placeholder="Please describe what happened in detail..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    required
                                    rows={4}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-medium text-slate-900 focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all outline-none text-sm resize-none"
                                />
                            </div>

                            {error && (
                                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
                                    <i className="fa-solid fa-triangle-exclamation text-rose-500"></i>
                                    <p className="text-rose-700 font-bold text-sm">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting || !reason}
                                className="w-full bg-rose-600 text-white font-black py-5 rounded-2xl text-sm uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {submitting ? <><i className="fa-solid fa-spinner fa-spin"></i> Submitting...</> : <><i className="fa-solid fa-paper-plane"></i> Submit Return Request</>}
                            </button>
                        </form>
                    )
                )}

                {/* Return History */}
                {tab === "history" && (
                    !session ? (
                        <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100 shadow-sm">
                            <i className="fa-solid fa-lock text-4xl text-slate-200 mb-4"></i>
                            <p className="font-black text-slate-400 text-lg mb-2">Login Required</p>
                            <p className="text-slate-400 text-sm">Please log in to view your return history.</p>
                        </div>
                    ) : loadingHistory ? (
                        <div className="py-20 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-slate-300"></i></div>
                    ) : returns.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100 shadow-sm">
                            <i className="fa-solid fa-box-open text-4xl text-slate-200 mb-4"></i>
                            <p className="font-black text-slate-400 text-lg">No return requests found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {returns.map(ret => {
                                const cfg = STATUS_CONFIG[ret.status] || STATUS_CONFIG["Pending"];
                                return (
                                    <div key={ret.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order #{ret.orderId.slice(-8).toUpperCase()}</p>
                                                <p className="font-black text-slate-900">{RETURN_REASONS.find(r => r.value === ret.reason)?.label || ret.reason}</p>
                                            </div>
                                            <div className={`flex items-center gap-2 text-[10px] font-black px-3 py-1.5 rounded-full border ${cfg.color}`}>
                                                <i className={`fa-solid ${cfg.icon}`}></i> {cfg.label}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-2">{ret.description}</p>
                                        <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <span><i className="fa-regular fa-calendar mr-1"></i>{new Date(ret.createdAt).toLocaleDateString("en-IN")}</span>
                                            {ret.refundAmount && <span className="text-emerald-600"><i className="fa-solid fa-indian-rupee-sign mr-1"></i>Refund: ₹{ret.refundAmount}</span>}
                                        </div>

                                        {/* Approval Progress */}
                                        <div className="mt-4 pt-4 border-t border-slate-50">
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Approval Progress</p>
                                            <div className="flex gap-2">
                                                {[
                                                    { key: ret.csApproval, label: "CS Team" },
                                                    { key: ret.pharmacistApproval, label: "Pharmacist" },
                                                    { key: ret.opsApproval, label: "Ops Manager" },
                                                ].map((step, i) => (
                                                    <div key={i} className="flex-1 text-center">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs mx-auto mb-1 ${step.key === "approved" ? "bg-emerald-100 text-emerald-600" : step.key === "rejected" ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"}`}>
                                                            <i className={`fa-solid ${step.key === "approved" ? "fa-check" : step.key === "rejected" ? "fa-xmark" : "fa-ellipsis"}`}></i>
                                                        </div>
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{step.label}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}
            </main>
        </div>
    );
}

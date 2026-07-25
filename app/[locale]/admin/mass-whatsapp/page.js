"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function MassWhatsAppAdmin() {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    const [counts, setCounts] = useState({ CUSTOMERS: 0, DOCTORS: 0, RETAILERS: 0 });
    const [audience, setAudience] = useState("CUSTOMERS");
    const [customNumbers, setCustomNumbers] = useState("");
    const [message, setMessage] = useState("");
    
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            router.push("/");
        }
    }, [status]);

    useEffect(() => {
        fetchCounts();
    }, []);

    const fetchCounts = async () => {
        try {
            const res = await fetch("/api/admin/mass-whatsapp");
            const data = await res.json();
            if (data.success) {
                setCounts(data.counts);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        setSending(true);
        setSuccessMsg("");
        setErrorMsg("");

        try {
            const res = await fetch("/api/admin/mass-whatsapp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ audience, message, customNumbers })
            });
            const data = await res.json();
            
            if (data.success) {
                setSuccessMsg(`Successfully queued broadcast to ${data.targetCount} numbers! The system is sending them in the background.`);
                setMessage("");
            } else {
                setErrorMsg(data.error || "Failed to send broadcast");
            }
        } catch (e) {
            setErrorMsg("An error occurred. Please try again.");
        } finally {
            setSending(false);
        }
    };

    if (status === "loading" || loading) return <div className="p-10 text-center font-bold text-slate-500">Loading Module...</div>;

    return (
        <div className="bg-[#0f172a] min-h-screen pb-20 text-slate-200">
            <div className="bg-[#1e293b] border-b border-slate-700 px-8 py-10 mb-8 shadow-xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 flex items-center">
                            <i className="fa-brands fa-whatsapp text-emerald-400 mr-3"></i>
                            Mass WhatsApp Engine
                        </h1>
                        <p className="text-emerald-400/80 font-bold uppercase tracking-widest text-[10px]">
                            Extract Contacts & Blast Promotional Messages
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-2 bg-[#1e293b] p-8 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">
                    <form onSubmit={handleSend} className="space-y-8">
                        <div>
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4"><i className="fa-solid fa-users mr-2"></i> 1. Select Target Audience</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${audience === 'CUSTOMERS' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="audience" value="CUSTOMERS" checked={audience === 'CUSTOMERS'} onChange={() => setAudience('CUSTOMERS')} className="hidden" />
                                        <i className="fa-solid fa-cart-shopping text-emerald-400 text-xl"></i>
                                        <div>
                                            <div className="font-black text-white">All Customers</div>
                                            <div className="text-xs text-slate-400 font-bold">Past buyers</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-black bg-slate-900 px-3 py-1 rounded text-emerald-400">{counts.CUSTOMERS || "~"}</div>
                                </label>

                                <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${audience === 'DOCTORS' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="audience" value="DOCTORS" checked={audience === 'DOCTORS'} onChange={() => setAudience('DOCTORS')} className="hidden" />
                                        <i className="fa-solid fa-user-doctor text-indigo-400 text-xl"></i>
                                        <div>
                                            <div className="font-black text-white">All Doctors</div>
                                            <div className="text-xs text-slate-400 font-bold">Registered clinics</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-black bg-slate-900 px-3 py-1 rounded text-indigo-400">{counts.DOCTORS}</div>
                                </label>

                                <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${audience === 'RETAILERS' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="audience" value="RETAILERS" checked={audience === 'RETAILERS'} onChange={() => setAudience('RETAILERS')} className="hidden" />
                                        <i className="fa-solid fa-store text-amber-400 text-xl"></i>
                                        <div>
                                            <div className="font-black text-white">All Retailers</div>
                                            <div className="text-xs text-slate-400 font-bold">Partner pharmacies</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-black bg-slate-900 px-3 py-1 rounded text-amber-400">{counts.RETAILERS}</div>
                                </label>

                                <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${audience === 'CUSTOM' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="audience" value="CUSTOM" checked={audience === 'CUSTOM'} onChange={() => setAudience('CUSTOM')} className="hidden" />
                                        <i className="fa-solid fa-list text-rose-400 text-xl"></i>
                                        <div>
                                            <div className="font-black text-white">Custom List</div>
                                            <div className="text-xs text-slate-400 font-bold">Paste numbers</div>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {audience === "CUSTOM" && (
                                <div className="mt-4">
                                    <textarea 
                                        rows="3"
                                        placeholder="Paste comma separated numbers here (e.g. 9876543210, 9123456789)"
                                        value={customNumbers}
                                        onChange={(e) => setCustomNumbers(e.target.value)}
                                        className="w-full bg-slate-800 border-2 border-slate-700 focus:border-rose-500 rounded-xl px-4 py-3 outline-none text-white text-sm font-mono"
                                    ></textarea>
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4"><i className="fa-solid fa-message mr-2"></i> 2. Compose Promotional Message</h2>
                            <textarea 
                                required
                                rows="6"
                                placeholder="Type your WhatsApp broadcast message here..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full bg-slate-800 border-2 border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 outline-none text-white text-sm transition-all"
                            ></textarea>
                            <p className="text-xs text-slate-500 font-bold mt-2"><i className="fa-solid fa-circle-info mr-1"></i> You can use WhatsApp formatting like *bold* or _italics_.</p>
                        </div>

                        {successMsg && (
                            <div className="bg-emerald-500/20 text-emerald-400 p-4 rounded-lg font-bold text-sm border border-emerald-500/30">
                                <i className="fa-solid fa-check-circle mr-2"></i> {successMsg}
                            </div>
                        )}
                        {errorMsg && (
                            <div className="bg-red-500/20 text-red-400 p-4 rounded-lg font-bold text-sm border border-red-500/30">
                                <i className="fa-solid fa-triangle-exclamation mr-2"></i> {errorMsg}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={sending || (!message.trim()) || (audience === 'CUSTOM' && !customNumbers.trim())}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {sending ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-brands fa-whatsapp"></i>}
                            {sending ? "Queuing Broadcast..." : "Send Mass Broadcast"}
                        </button>
                    </form>
                </div>

                {/* Preview Panel */}
                <div>
                    <div className="sticky top-8">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Live Preview</h2>
                        <div className="bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-cover rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 h-[500px] flex flex-col relative">
                            {/* WhatsApp Header */}
                            <div className="bg-[#075e54] text-white p-4 flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                    <i className="fa-solid fa-heart-pulse text-[#075e54] text-xl"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Swastik Medicare</h3>
                                    <p className="text-[10px] opacity-80 font-medium">Business Account</p>
                                </div>
                            </div>

                            {/* Message Bubble */}
                            <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-end pb-10">
                                {message ? (
                                    <div className="bg-[#dcf8c6] text-[#303030] p-3 rounded-lg rounded-tr-none shadow max-w-[85%] self-end text-sm relative">
                                        <p className="whitespace-pre-wrap">{message}</p>
                                        <div className="text-[9px] text-right text-slate-500 mt-1">Just now <i className="fa-solid fa-check-double text-blue-500"></i></div>
                                    </div>
                                ) : (
                                    <div className="bg-white/80 backdrop-blur text-slate-500 p-3 rounded-xl text-xs text-center font-bold italic shadow">
                                        Start typing to preview your message...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

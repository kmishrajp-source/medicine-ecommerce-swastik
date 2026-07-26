"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function MassWhatsAppAdmin() {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    const [counts, setCounts] = useState({ CUSTOMERS: 0, DOCTORS: 0, RETAILERS: 0, CAMPAIGN_LEADS: 0 });
    const [audience, setAudience] = useState("CUSTOMERS");
    const [customNumbers, setCustomNumbers] = useState("");
    const [message, setMessage] = useState("");
    const [method, setMethod] = useState("WHATSAPP");
    
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
                body: JSON.stringify({ audience, message, customNumbers, method })
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
                            <i className="fa-solid fa-satellite-dish text-emerald-400 mr-3"></i>
                            Universal Broadcast Engine
                        </h1>
                        <p className="text-emerald-400/80 font-bold uppercase tracking-widest text-[10px]">
                            Extract Contacts & Blast Promotional Messages via SMS or WhatsApp
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-2 bg-[#1e293b] p-8 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">
                    <form onSubmit={handleSend} className="space-y-8">
                        <div>
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4"><i className="fa-solid fa-paper-plane mr-2"></i> 1. Delivery Method</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${method === 'WHATSAPP' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}>
                                    <input type="radio" name="method" value="WHATSAPP" checked={method === 'WHATSAPP'} onChange={() => setMethod('WHATSAPP')} className="hidden" />
                                    <i className="fa-brands fa-whatsapp text-emerald-400 text-2xl"></i>
                                    <div>
                                        <div className="font-black text-white">WhatsApp Message</div>
                                        <div className="text-xs text-slate-400 font-bold">Best for loyal customers</div>
                                    </div>
                                </label>
                                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${method === 'SMS' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}>
                                    <input type="radio" name="method" value="SMS" checked={method === 'SMS'} onChange={() => setMethod('SMS')} className="hidden" />
                                    <i className="fa-solid fa-comment-sms text-blue-400 text-2xl"></i>
                                    <div>
                                        <div className="font-black text-white">Traditional SMS Text</div>
                                        <div className="text-xs text-slate-400 font-bold">Best for cold lists (safe)</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4"><i className="fa-solid fa-users mr-2"></i> 2. Select Target Audience</h2>
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

                                <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${audience === 'CAMPAIGN_LEADS' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="audience" value="CAMPAIGN_LEADS" checked={audience === 'CAMPAIGN_LEADS'} onChange={() => setAudience('CAMPAIGN_LEADS')} className="hidden" />
                                        <i className="fa-solid fa-bullhorn text-pink-400 text-xl"></i>
                                        <div>
                                            <div className="font-black text-white">Campaign Leads</div>
                                            <div className="text-xs text-slate-400 font-bold">Marketing funnels</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-black bg-slate-900 px-3 py-1 rounded text-pink-400">{counts.CAMPAIGN_LEADS}</div>
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
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4"><i className="fa-solid fa-message mr-2"></i> 3. Compose Promotional Message</h2>
                            <div className="relative">
                                <textarea 
                                    required
                                    rows="6"
                                    placeholder={method === "SMS" ? "Type your SMS text message here..." : "Type your WhatsApp broadcast message here..."}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className={`w-full bg-slate-800 border-2 ${method === 'SMS' && message.length > 160 ? 'border-rose-500' : 'border-slate-700 focus:border-emerald-500'} rounded-xl px-4 py-3 outline-none text-white text-sm transition-all`}
                                ></textarea>
                                {method === "SMS" && (
                                    <div className={`absolute bottom-3 right-3 text-[10px] font-black px-2 py-1 rounded ${message.length > 160 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-400'}`}>
                                        {message.length} / 160 chars
                                    </div>
                                )}
                            </div>
                            {method === "WHATSAPP" ? (
                                <p className="text-xs text-slate-500 font-bold mt-2"><i className="fa-solid fa-circle-info mr-1"></i> You can use WhatsApp formatting like *bold* or _italics_.</p>
                            ) : (
                                <p className={`text-xs font-bold mt-2 ${message.length > 160 ? 'text-rose-400' : 'text-slate-500'}`}>
                                    <i className="fa-solid fa-triangle-exclamation mr-1"></i> {message.length > 160 ? "Warning: Messages over 160 characters will cost 2 SMS credits per person." : "Standard SMS length is 160 characters."}
                                </p>
                            )}
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
                        <div className={`bg-cover rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 h-[500px] flex flex-col relative ${method === 'SMS' ? "bg-slate-900" : "bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]"}`}>
                            {/* Header */}
                            <div className={`${method === 'SMS' ? 'bg-slate-800/90 backdrop-blur' : 'bg-[#075e54]'} text-white p-4 flex items-center gap-3`}>
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                    {method === 'SMS' ? (
                                        <i className="fa-solid fa-comment-sms text-slate-800 text-xl"></i>
                                    ) : (
                                        <i className="fa-solid fa-heart-pulse text-[#075e54] text-xl"></i>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Swastik Medicare</h3>
                                    <p className="text-[10px] opacity-80 font-medium">{method === 'SMS' ? 'Text Message' : 'Business Account'}</p>
                                </div>
                            </div>

                            {/* Message Bubble */}
                            <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-end pb-10">
                                {message ? (
                                    <div className={`${method === 'SMS' ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-[#dcf8c6] text-[#303030] rounded-tr-none'} p-3 rounded-2xl shadow max-w-[85%] self-end text-sm relative`}>
                                        <p className="whitespace-pre-wrap">{message}</p>
                                        <div className={`text-[9px] text-right mt-1 ${method === 'SMS' ? 'text-blue-200' : 'text-slate-500'}`}>
                                            Just now {method === 'WHATSAPP' && <i className="fa-solid fa-check-double text-blue-500"></i>}
                                        </div>
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

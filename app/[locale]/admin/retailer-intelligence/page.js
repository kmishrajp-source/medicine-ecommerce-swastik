"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

export default function RetailerIntelligencePage() {
    const { cartCount, toggleCart } = useCart();
    const [data, setData] = useState({ stats: {}, cities: [], retailers: [] });
    const [loading, setLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    
    // Broadcast State
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [broadcastCity, setBroadcastCity] = useState("ALL");
    const [broadcastChannel, setBroadcastChannel] = useState("all");
    const [customBroadcastMsg, setCustomBroadcastMsg] = useState("");
    const [broadcasting, setBroadcasting] = useState(false);
    const [broadcastResult, setBroadcastResult] = useState(null);

    useEffect(() => {
        fetchData();
    }, [selectedCity]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/retailer-intelligence?city=${selectedCity}`);
            const json = await res.json();
            if (json.success) {
                setData(json);
            }
        } catch (err) {
            console.error("Failed to load retailer intelligence data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        setBroadcasting(true);
        setBroadcastResult(null);
        try {
            const res = await fetch("/api/admin/retailer-intelligence", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetCity: broadcastCity,
                    channel: broadcastChannel,
                    customMessage: customBroadcastMsg
                })
            });
            const json = await res.json();
            if (json.success) {
                setBroadcastResult({ type: "success", message: json.message });
                setTimeout(() => {
                    setShowBroadcastModal(false);
                    fetchData();
                }, 2500);
            } else {
                setBroadcastResult({ type: "error", message: json.error || "Broadcast failed" });
            }
        } catch (err) {
            setBroadcastResult({ type: "error", message: "Network error sending broadcast" });
        } finally {
            setBroadcasting(false);
        }
    };

    const filteredRetailers = data.retailers.filter(r => {
        const query = searchQuery.toLowerCase();
        return (
            (r.shopName || "").toLowerCase().includes(query) ||
            (r.phone || "").includes(query) ||
            (r.city || "").toLowerCase().includes(query) ||
            (r.licenseNumber || "").toLowerCase().includes(query) ||
            (r.gstNumber || "").toLowerCase().includes(query)
        );
    });

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-xl border border-emerald-500/30">
                                <i className="fa-solid fa-map-location-dot"></i>
                            </span>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-white">Retailer Intelligence & Supply Network</h1>
                                <p className="text-slate-400 text-sm">Geographic Outreach, 10% Commission Compliance & Prescription Supply</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowBroadcastModal(true)}
                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 text-sm"
                        >
                            <i className="fa-brands fa-whatsapp text-lg"></i>
                            <span>Broadcast Onboarding Invite</span>
                        </button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                    <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Total Shops</span>
                        <span className="text-2xl font-black text-white">{data.stats.total || 0}</span>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block mb-1">Verified Active</span>
                        <span className="text-2xl font-black text-emerald-400">{data.stats.verified || 0}</span>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
                        <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block mb-1">Directory Leads</span>
                        <span className="text-2xl font-black text-amber-400">{data.stats.directoryLeads || 0}</span>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
                        <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider block mb-1">Live Online</span>
                        <span className="text-2xl font-black text-cyan-400">{data.stats.online || 0}</span>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
                        <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider block mb-1">Swastik Rider</span>
                        <span className="text-2xl font-black text-indigo-400">{data.stats.swastikRiders || 0}</span>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
                        <span className="text-purple-400 text-xs font-bold uppercase tracking-wider block mb-1">Self Rider</span>
                        <span className="text-2xl font-black text-purple-400">{data.stats.selfRiders || 0}</span>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-2xl mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <span className="text-slate-400 text-xs font-bold uppercase">City Filter:</span>
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
                        >
                            <option value="ALL">All Locations (Global)</option>
                            {data.cities.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full md:w-80 relative">
                        <input
                            type="text"
                            placeholder="Search pharmacy, phone, GST, license..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                        />
                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-500 text-xs"></i>
                    </div>
                </div>

                {/* Retailers Table */}
                <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700/60 font-black">
                                <tr>
                                    <th className="py-3.5 px-4">Pharmacy & City</th>
                                    <th className="py-3.5 px-4">Contact Phone</th>
                                    <th className="py-3.5 px-4">Drug License & GSTIN</th>
                                    <th className="py-3.5 px-4">PhonePe / UPI</th>
                                    <th className="py-3.5 px-4">Commission</th>
                                    <th className="py-3.5 px-4">Rider Mode</th>
                                    <th className="py-3.5 px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/40">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-slate-400 font-bold">
                                            <i className="fa-solid fa-spinner fa-spin text-2xl text-emerald-400 mb-2 block"></i>
                                            Loading Retailer Network...
                                        </td>
                                    </tr>
                                ) : filteredRetailers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-slate-400 font-bold">
                                            No pharmacies found for the selected criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRetailers.map((r) => (
                                        <tr key={r.id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-white text-base">{r.shopName}</div>
                                                <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                    <i className="fa-solid fa-location-dot text-rose-400"></i>
                                                    <span>{r.city || "Gorakhpur"} • {r.address ? r.address.substring(0, 30) + '...' : 'Address missing'}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                                                {r.phone || "N/A"}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="text-xs">
                                                    <span className="text-slate-400">DL: </span>
                                                    <span className="font-mono text-emerald-400 font-semibold">{r.licenseNumber || "Pending"}</span>
                                                </div>
                                                <div className="text-xs mt-0.5">
                                                    <span className="text-slate-400">GST: </span>
                                                    <span className="font-mono text-cyan-400 font-semibold">{r.gstNumber || "N/A"}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-xs text-purple-300">
                                                {r.bankUpi || "Pending Setup"}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                                    {r.agreedPlatformMargin || 10}% Standard
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {r.riderPreference === "SELF" ? (
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                        <i className="fa-solid fa-person-biking mr-1"></i> Self-Managed
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                                        <i className="fa-solid fa-truck-medical mr-1"></i> Swastik Rider
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {r.verified ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                                                        <i className="fa-solid fa-circle-check"></i> Verified
                                                    </span>
                                                ) : r.isDirectory ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
                                                        <i className="fa-solid fa-address-book"></i> Lead
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
                                                        <i className="fa-solid fa-clock"></i> Unverified
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Broadcast Outreach Modal */}
                {showBroadcastModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-lg">
                                        <i className="fa-brands fa-whatsapp"></i>
                                    </span>
                                    <h3 className="font-bold text-lg text-white">Broadcast Pharmacy Onboarding</h3>
                                </div>
                                <button
                                    onClick={() => setShowBroadcastModal(false)}
                                    className="text-slate-400 hover:text-white text-xl"
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            <form onSubmit={handleBroadcast} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Target Geography</label>
                                    <select
                                        value={broadcastCity}
                                        onChange={(e) => setBroadcastCity(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200"
                                    >
                                        <option value="ALL">All Registered Leads & Unverified Pharmacies</option>
                                        {data.cities.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Channel</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: "all", label: "WhatsApp + SMS" },
                                            { id: "whatsapp", label: "WhatsApp Only" },
                                            { id: "sms", label: "SMS Only" }
                                        ].map(ch => (
                                            <button
                                                key={ch.id}
                                                type="button"
                                                onClick={() => setBroadcastChannel(ch.id)}
                                                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${broadcastChannel === ch.id ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                                            >
                                                {ch.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Custom Invitation Message (Optional)</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Leave empty for default MSG91 10% commission partnership template..."
                                        value={customBroadcastMsg}
                                        onChange={(e) => setCustomBroadcastMsg(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                    ></textarea>
                                </div>

                                {broadcastResult && (
                                    <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${broadcastResult.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                                        <i className={`fa-solid ${broadcastResult.type === 'success' ? 'fa-check' : 'fa-triangle-exclamation'}`}></i>
                                        <span>{broadcastResult.message}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={broadcasting}
                                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-sm flex items-center justify-center gap-2 mt-2"
                                >
                                    {broadcasting ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                            <span>Sending Outbound Broadcast...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-paper-plane"></i>
                                            <span>Launch Outreach Broadcast</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

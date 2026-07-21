"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function MarketIntelligenceDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [message, setMessage] = useState(null);
    const [broadcast, setBroadcast] = useState(null);
    const [broadcasting, setBroadcasting] = useState(false);

    useEffect(() => {
        let interval;
        if (broadcast && broadcast.status === 'ACTIVE') {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/admin/market-intelligence/broadcast?id=${broadcast.id}`);
                    const data = await res.json();
                    if (data.success) {
                        setBroadcast(data.broadcast);
                    }
                } catch (err) {
                    console.error("Polling error", err);
                }
            }, 3000); // Poll every 3s
        }
        return () => clearInterval(interval);
    }, [broadcast]);

    const handleBroadcast = async () => {
        if (!results?.primaryProduct) return;
        setBroadcasting(true);
        try {
            const res = await fetch("/api/admin/market-intelligence/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ medicineName: results.primaryProduct.name })
            });
            const data = await res.json();
            if (data.success) {
                setBroadcast(data.broadcast);
            }
        } catch (error) {
            console.error("Broadcast failed", error);
        } finally {
            setBroadcasting(false);
        }
    };

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            router.push("/");
        }
    }, [status]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery || searchQuery.length < 2) return;
        
        setLoading(true);
        setResults(null);
        setMessage(null);
        setBroadcast(null);

        try {
            const res = await fetch(`/api/admin/market-intelligence?q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            
            if (data.success && data.results) {
                setResults(data.results);
            } else {
                setMessage("No intelligence data found for this query.");
            }
        } catch (error) {
            console.error(error);
            setMessage("An error occurred while fetching intelligence data.");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") return <div className="p-10 text-center font-bold text-slate-500">Loading Module...</div>;

    return (
        <div className="bg-[#0f172a] min-h-screen pb-20 text-slate-200">
            {/* Premium Dark Header */}
            <div className="bg-[#1e293b] border-b border-slate-700 px-8 py-10 mb-8 shadow-xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 flex items-center">
                            <i className="fa-solid fa-radar text-cyan-400 mr-3 animate-pulse"></i>
                            Market Intelligence
                        </h1>
                        <p className="text-cyan-500/80 font-bold uppercase tracking-widest text-[10px]">
                            Real-Time Medical Stock & Vendor Radar
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-10">
                    <div className="relative flex items-center">
                        <i className="fa-solid fa-search absolute left-6 text-slate-400 text-lg"></i>
                        <input 
                            type="text" 
                            placeholder="Search by Medicine Name, Salt, or Composition..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#1e293b] border-2 border-slate-700 focus:border-cyan-500 rounded-full py-5 pl-16 pr-40 text-white font-bold outline-none transition-all shadow-lg placeholder:text-slate-500 text-lg"
                        />
                        <button 
                            type="submit"
                            disabled={loading}
                            className="absolute right-3 px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black uppercase tracking-widest text-xs rounded-full transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
                        >
                            {loading ? "Scanning..." : "Scan Market"}
                        </button>
                    </div>
                </form>

                {message && (
                    <div className="p-6 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl text-center font-bold mb-8">
                        {message}
                    </div>
                )}

                {loading && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-[#1e293b] p-8 rounded-3xl h-48 border border-slate-700/50"></div>
                            <div className="bg-[#1e293b] p-8 rounded-3xl h-64 border border-slate-700/50"></div>
                        </div>
                        <div className="space-y-8">
                            <div className="bg-[#1e293b] p-8 rounded-3xl h-48 border border-slate-700/50"></div>
                            <div className="bg-[#1e293b] p-8 rounded-3xl h-64 border border-slate-700/50"></div>
                        </div>
                    </div>
                )}

                {results && !loading && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT COLUMN: Target & Availability */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* Primary Target Info */}
                            <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-700 shadow-lg">
                                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                                    <i className="fa-solid fa-bullseye text-cyan-400 mr-2"></i> Primary Target
                                </h2>
                                <div className="flex gap-6 items-center">
                                    {results.primaryProduct.image && (
                                        <img src={results.primaryProduct.image} alt="Medicine" className="w-24 h-24 object-contain rounded-xl bg-white p-2" />
                                    )}
                                    <div>
                                        <h3 className="text-3xl font-black text-white tracking-tighter mb-1">{results.primaryProduct.name}</h3>
                                        <p className="text-cyan-400 font-bold text-sm mb-3">MRP: ₹{results.primaryProduct.mrp || results.primaryProduct.price}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {results.primaryProduct.composition && (
                                                <span className="px-3 py-1 bg-slate-800 rounded-full text-[10px] font-bold text-slate-300">
                                                    Comp: {results.primaryProduct.composition}
                                                </span>
                                            )}
                                            {results.primaryProduct.salt && (
                                                <span className="px-3 py-1 bg-slate-800 rounded-full text-[10px] font-bold text-slate-300">
                                                    Salt: {results.primaryProduct.salt}
                                                </span>
                                            )}
                                        </div>
                                        <button 
                                            onClick={handleBroadcast}
                                            disabled={broadcasting || broadcast}
                                            className="mt-4 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-lg transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <i className={`fa-brands fa-whatsapp text-sm ${broadcasting ? 'animate-ping' : ''}`}></i>
                                            {broadcast ? 'Broadcast Active' : 'Live WhatsApp Broadcast'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Market Analytics */}
                            {results.analytics && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gradient-to-br from-cyan-500/10 to-transparent p-6 rounded-2xl border border-cyan-500/30 shadow-lg">
                                        <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2 flex items-center"><i className="fa-solid fa-boxes-stacked mr-2"></i> Total Market Stock</p>
                                        <p className="text-3xl font-black text-white">{results.analytics.totalStock} <span className="text-sm font-normal text-slate-400">units</span></p>
                                    </div>
                                    <div className="bg-gradient-to-br from-emerald-500/10 to-transparent p-6 rounded-2xl border border-emerald-500/30 shadow-lg">
                                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center"><i className="fa-solid fa-tag mr-2"></i> Lowest Price</p>
                                        <p className="text-3xl font-black text-white">₹{results.analytics.lowestPrice !== null && results.analytics.lowestPrice !== Infinity ? results.analytics.lowestPrice : '-'}</p>
                                        {results.analytics.lowestPriceRetailer && (
                                            <p className="text-xs text-slate-400 mt-1 truncate font-bold">at {results.analytics.lowestPriceRetailer}</p>
                                        )}
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-500/10 to-transparent p-6 rounded-2xl border border-purple-500/30 shadow-lg">
                                        <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2 flex items-center"><i className="fa-solid fa-chart-line mr-2"></i> Avg Market Price</p>
                                        <p className="text-3xl font-black text-white">₹{results.analytics.averagePrice || '-'}</p>
                                        <p className="text-xs font-bold mt-1">
                                            {results.primaryProduct?.mrp ? (
                                                Number(results.analytics.averagePrice) > results.primaryProduct.mrp 
                                                    ? <span className="text-red-400"><i className="fa-solid fa-arrow-up text-[10px]"></i> Above MRP (₹{results.primaryProduct.mrp})</span>
                                                    : <span className="text-emerald-400"><i className="fa-solid fa-arrow-down text-[10px]"></i> Below MRP (₹{results.primaryProduct.mrp})</span>
                                            ) : <span className="text-slate-400">vs MRP</span>}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Retailer Availability */}
                            <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-700 shadow-lg">
                                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-between">
                                    <span><i className="fa-solid fa-store text-emerald-400 mr-2"></i> Retailer Network Availability</span>
                                    <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">{results.retailerAvailability?.length || 0} Found</span>
                                </h2>
                                
                                {results.retailerAvailability?.length > 0 ? (
                                    <div className="space-y-4">
                                        {results.retailerAvailability.map((inv, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                                                <div>
                                                    <p className="font-bold text-white text-sm">{inv.retailer?.shopName || "Unknown Shop"}</p>
                                                    <p className="text-xs text-slate-400 mt-1"><i className="fa-solid fa-location-dot mr-1"></i> {inv.retailer?.address || inv.deliveryArea}</p>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <div className="flex items-center gap-2">
                                                        {inv.stock < 10 && (
                                                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-black rounded uppercase">Low Stock</span>
                                                        )}
                                                        <p className="text-2xl font-black text-emerald-400 tracking-tighter">{inv.stock} <span className="text-xs font-bold text-slate-500 uppercase">Units</span></p>
                                                    </div>
                                                    <p className="text-xs text-slate-400 font-bold mt-1">Listed at ₹{inv.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500 font-bold text-sm">
                                        No active retailer stock found for this item.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Alternatives & Vendors */}
                        <div className="space-y-8">
                            
                            {/* Live WhatsApp Broadcast feed */}
                            {broadcast && (
                                <div className="bg-gradient-to-b from-[#1e293b] to-slate-900 p-8 rounded-3xl border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none"></div>
                                    <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center">
                                        <span className="relative flex h-3 w-3 mr-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                        </span>
                                        Live WhatsApp Broadcast
                                    </h2>
                                    
                                    <div className="flex justify-between items-end mb-6">
                                        <div>
                                            <p className="text-2xl font-black text-white">{broadcast.repliesCount} <span className="text-sm font-bold text-slate-500">Replies</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Sent to</p>
                                            <p className="text-lg font-bold text-slate-200">{broadcast.sentCount} Retailers</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        {broadcast.responses && broadcast.responses.length > 0 ? (
                                            broadcast.responses.map(quote => (
                                                <div key={quote.id} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="text-sm font-bold text-white">{quote.retailerName || "Unknown Shop"}</p>
                                                        <span className="text-[9px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded font-bold">Just Now</span>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Yes, {quote.quantity} Units</span>
                                                        <span className="text-xs font-black text-white">₹{quote.price}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-slate-500 text-xs font-bold animate-pulse">
                                                Waiting for WhatsApp replies...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Alternatives */}
                            <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-700 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none"></div>
                                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                                    <i className="fa-solid fa-code-compare text-amber-400 mr-2"></i> Chemical Alternatives
                                </h2>
                                
                                {results.alternatives?.length > 0 ? (
                                    <div className="space-y-4">
                                        {results.alternatives.map((alt, idx) => (
                                            <div key={idx} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-amber-500/50 transition-colors cursor-pointer" onClick={() => setSearchQuery(alt.name)}>
                                                <p className="font-bold text-white text-sm">{alt.name}</p>
                                                <p className="text-xs text-amber-400 font-bold mt-1">₹{alt.mrp || alt.price}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-slate-500 text-xs font-bold">
                                        No matching alternatives found based on salt/composition.
                                    </div>
                                )}
                            </div>

                            {/* Vendors / Procurement */}
                            <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-700 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full pointer-events-none"></div>
                                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                                    <i className="fa-solid fa-truck-fast text-purple-400 mr-2"></i> Quick Procurement
                                </h2>
                                
                                {results.vendors?.length > 0 ? (
                                    <div className="space-y-4">
                                        {results.vendors.map((vendor, idx) => (
                                            <div key={idx} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                                <p className="font-bold text-white text-sm">{vendor.agencyName}</p>
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-1"><i className="fa-solid fa-warehouse mr-1"></i> {vendor.warehouseAddress}</p>
                                                <button className="mt-3 w-full py-2 bg-purple-500/20 text-purple-400 font-bold text-xs rounded-lg hover:bg-purple-500 hover:text-white transition-colors">
                                                    Request Stock
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-slate-500 text-xs font-bold">
                                        No active vendors mapped for this item.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

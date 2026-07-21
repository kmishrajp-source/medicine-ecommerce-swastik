"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function TrackAndTraceDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [searchBatch, setSearchBatch] = useState("");
    const [loading, setLoading] = useState(false);
    const [batchData, setBatchData] = useState(null);
    const [recentBatches, setRecentBatches] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            router.push("/");
        } else if (status === "authenticated") {
            fetchRecentBatches();
        }
    }, [status]);

    const fetchRecentBatches = async () => {
        try {
            const res = await fetch("/api/admin/tracking");
            const data = await res.json();
            if (data.success) {
                setRecentBatches(data.batches);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchBatch) return;

        setLoading(true);
        setError(null);
        setBatchData(null);

        try {
            const res = await fetch(`/api/admin/tracking?batchNumber=${encodeURIComponent(searchBatch)}`);
            const data = await res.json();

            if (data.success) {
                setBatchData(data.batch);
            } else {
                setError(data.error || "Batch not found in the provenance ledger.");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to fetch tracking data.");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") return <div className="p-10 text-center font-bold text-slate-500">Loading Tracker...</div>;

    return (
        <div className="bg-[#0f172a] min-h-screen pb-20 text-slate-200">
            {/* Header */}
            <div className="bg-[#1e293b] border-b border-slate-700 px-8 py-10 mb-8 shadow-xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 flex items-center">
                            <i className="fa-solid fa-route text-cyan-400 mr-3 animate-pulse"></i>
                            Supply Chain Traceability
                        </h1>
                        <p className="text-cyan-500/80 font-bold uppercase tracking-widest text-[10px]">
                            Track & Trace Medicine Provenance Ledger
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-10">
                    <div className="relative flex items-center">
                        <i className="fa-solid fa-barcode absolute left-6 text-slate-400 text-lg"></i>
                        <input 
                            type="text" 
                            placeholder="Enter Batch Number to Trace (e.g. BTH-9921)..."
                            value={searchBatch}
                            onChange={(e) => setSearchBatch(e.target.value)}
                            className="w-full bg-[#1e293b] border-2 border-slate-700 focus:border-cyan-500 rounded-full py-5 pl-16 pr-40 text-white font-bold outline-none transition-all shadow-lg placeholder:text-slate-500 text-lg"
                        />
                        <button 
                            type="submit"
                            disabled={loading}
                            className="absolute right-3 px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black uppercase tracking-widest text-xs rounded-full transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
                        >
                            {loading ? "Tracing..." : "Trace Origin"}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="p-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-center font-bold mb-8">
                        <i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}
                    </div>
                )}

                {batchData && (
                    <div className="space-y-8">
                        <div className="bg-[#1e293b] p-8 rounded-3xl border border-slate-700 shadow-xl">
                            <div className="flex justify-between items-start mb-6 border-b border-slate-700 pb-6">
                                <div>
                                    <p className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-1">Authentic Batch</p>
                                    <h2 className="text-3xl font-black text-white">{batchData.batchNumber}</h2>
                                    <p className="text-sm text-slate-400 mt-2">Product ID: {batchData.productId}</p>
                                </div>
                                <div className="text-right">
                                    <div className="bg-cyan-500/10 text-cyan-400 px-4 py-2 rounded-xl border border-cyan-500/30 inline-block font-bold">
                                        Total Units: {batchData.stock}
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">
                                        Exp: {new Date(batchData.expiryDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Movement Timeline</h3>
                            
                            <div className="relative border-l-2 border-slate-700 ml-4 space-y-10 py-4">
                                {batchData.movements.length === 0 ? (
                                    <p className="pl-6 text-slate-500 font-bold">No movement logs found for this batch.</p>
                                ) : (
                                    batchData.movements.map((movement, index) => (
                                        <div key={movement.id} className="relative pl-8">
                                            <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-[#1e293b] ${
                                                movement.action === 'MINTED' ? 'bg-cyan-400' :
                                                movement.action === 'DISPATCHED' ? 'bg-amber-400' :
                                                movement.action === 'RECEIVED' ? 'bg-emerald-400' : 'bg-slate-400'
                                            }`}></div>
                                            
                                            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                                                        movement.action === 'MINTED' ? 'bg-cyan-500/20 text-cyan-400' :
                                                        movement.action === 'DISPATCHED' ? 'bg-amber-500/20 text-amber-400' :
                                                        movement.action === 'RECEIVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                                                    }`}>
                                                        {movement.action}
                                                    </span>
                                                    <span className="text-slate-500 text-xs font-bold">
                                                        {new Date(movement.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                
                                                <p className="text-white font-bold mb-1">
                                                    {movement.entityType} Activity
                                                </p>
                                                <p className="text-sm text-slate-400">
                                                    Quantity Processed: <strong className="text-slate-200">{movement.quantity} units</strong>
                                                </p>
                                                
                                                {(movement.fromEntityId || movement.toEntityId) && (
                                                    <div className="mt-4 flex gap-4 text-xs font-bold">
                                                        {movement.fromEntityId && <span className="text-amber-400"><i className="fa-solid fa-arrow-up-from-bracket mr-1"></i> From: {movement.fromEntityId}</span>}
                                                        {movement.toEntityId && <span className="text-emerald-400"><i className="fa-solid fa-arrow-down-to-bracket mr-1"></i> To: {movement.toEntityId}</span>}
                                                    </div>
                                                )}
                                                
                                                {movement.notes && (
                                                    <p className="mt-4 text-xs text-slate-500 bg-slate-900/50 p-2 rounded">
                                                        {movement.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {!batchData && recentBatches.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Recently Active Batches</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {recentBatches.map(batch => (
                                <div 
                                    key={batch.id} 
                                    onClick={() => setSearchBatch(batch.batchNumber)}
                                    className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 cursor-pointer hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="font-black text-white text-lg">{batch.batchNumber}</p>
                                        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded font-bold">{batch.stock} units</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-4 truncate">Product: {batch.productId}</p>
                                    
                                    {batch.movements && batch.movements.length > 0 && (
                                        <div className="border-t border-slate-700 pt-3 mt-3">
                                            <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Last Event</p>
                                            <p className="text-xs text-cyan-400 font-bold">{batch.movements[0].action} at {new Date(batch.movements[0].timestamp).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

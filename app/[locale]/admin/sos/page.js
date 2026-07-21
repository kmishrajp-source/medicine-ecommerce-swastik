"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminSOSDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            router.push("/");
        } else if (status === "authenticated") {
            fetchRequests();
        }
    }, [status]);

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/admin/sos");
            const data = await res.json();
            if (data.success) {
                setRequests(data.sosRequests);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await fetch("/api/admin/sos", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                fetchRequests(); // refresh
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-slate-500">Loading SOS Dashboard...</div>;

    const pendingCount = requests.filter(r => r.status === 'PENDING').length;

    return (
        <div className="bg-[#0f172a] min-h-screen pb-20 text-slate-200">
            {/* Header */}
            <div className="bg-[#1e293b] border-b border-slate-700 px-8 py-10 mb-8 shadow-xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 flex items-center">
                            <i className="fa-solid fa-truck-medical text-red-500 mr-3 animate-pulse"></i>
                            SOS Dispatch
                        </h1>
                        <p className="text-red-400 font-bold uppercase tracking-widest text-[10px]">
                            Emergency Medicine Requests from Unregistered Entities
                        </p>
                    </div>
                    {pendingCount > 0 && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-3 rounded-full font-black uppercase tracking-widest text-sm flex items-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                            <i className="fa-solid fa-triangle-exclamation mr-2 animate-bounce"></i>
                            {pendingCount} Critical Action{pendingCount > 1 ? 's' : ''} Needed
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8">
                {requests.length === 0 ? (
                    <div className="text-center py-20 bg-[#1e293b] rounded-3xl border border-slate-700">
                        <i className="fa-solid fa-check-double text-6xl text-slate-600 mb-4"></i>
                        <h2 className="text-2xl font-black text-slate-400 uppercase tracking-widest">No Active SOS Requests</h2>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {requests.map(req => (
                            <div key={req.id} className={`bg-[#1e293b] rounded-3xl p-6 border shadow-lg ${req.status === 'PENDING' ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-slate-700'}`}>
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded font-black text-[10px] uppercase tracking-widest ${
                                                req.status === 'PENDING' ? 'bg-red-500/20 text-red-400' :
                                                req.status === 'ASSIGNED' ? 'bg-amber-500/20 text-amber-400' :
                                                req.status === 'FULFILLED' ? 'bg-emerald-500/20 text-emerald-400' :
                                                'bg-slate-700 text-slate-400'
                                            }`}>
                                                {req.status}
                                            </span>
                                            <span className="text-slate-500 text-xs font-bold">
                                                {new Date(req.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-2xl font-black text-white tracking-tighter mb-1 text-red-400">
                                            {req.medicineName} <span className="text-sm font-bold text-slate-400">({req.quantity})</span>
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Requester</p>
                                                <p className="text-sm font-bold text-white">{req.contactName} <span className="text-slate-400 font-normal">({req.entityType})</span></p>
                                                <p className="text-sm text-cyan-400 font-bold"><i className="fa-solid fa-phone mr-1"></i> {req.contactPhone}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Location</p>
                                                <p className="text-sm font-bold text-white"><i className="fa-solid fa-location-dot text-slate-400 mr-1"></i> {req.location}</p>
                                                {req.pincode && <p className="text-xs text-slate-400 mt-1">Pin: {req.pincode}</p>}
                                            </div>
                                        </div>
                                        
                                        {req.notes && (
                                            <div className="mt-4 p-3 bg-slate-800 rounded-lg text-sm text-slate-300">
                                                <strong className="text-slate-500 mr-2">Notes:</strong> {req.notes}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-3 min-w-[200px]">
                                        {req.status === 'PENDING' && (
                                            <>
                                                <button onClick={() => updateStatus(req.id, 'ASSIGNED')} className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black uppercase tracking-widest text-xs rounded-xl transition-all">
                                                    Assign & Contact
                                                </button>
                                                <button onClick={() => updateStatus(req.id, 'REJECTED')} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase tracking-widest text-xs rounded-xl transition-all">
                                                    Mark Invalid
                                                </button>
                                            </>
                                        )}
                                        {req.status === 'ASSIGNED' && (
                                            <button onClick={() => updateStatus(req.id, 'FULFILLED')} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black uppercase tracking-widest text-xs rounded-xl transition-all">
                                                Mark Fulfilled
                                            </button>
                                        )}
                                        {['FULFILLED', 'REJECTED'].includes(req.status) && (
                                            <div className="text-center p-4 bg-slate-800/50 rounded-xl text-slate-500 font-bold text-xs uppercase tracking-widest border border-slate-700/50">
                                                Action Completed
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

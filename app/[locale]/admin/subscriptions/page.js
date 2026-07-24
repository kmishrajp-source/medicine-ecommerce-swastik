"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminSubscriptions() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            router.push("/");
        }
    }, [status]);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const res = await fetch("/api/admin/subscriptions"); // Note: we need to create this API endpoint to list them
            const data = await res.json();
            if (data.success) {
                setSubscriptions(data.subscriptions);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const triggerCron = async () => {
        try {
            const res = await fetch("/api/cron/refill-reminders", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                alert(`Cron executed successfully! Processed ${data.processedCount} refills.`);
            }
        } catch (e) {
            alert("Error triggering cron.");
        }
    }

    if (status === "loading" || loading) return <div className="p-10 text-center font-bold text-slate-500">Loading Module...</div>;

    return (
        <div className="bg-[#0f172a] min-h-screen pb-20 text-slate-200">
            <div className="bg-[#1e293b] border-b border-slate-700 px-8 py-10 mb-8 shadow-xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 flex items-center">
                            <i className="fa-solid fa-repeat text-emerald-400 mr-3"></i>
                            Chronic Care Subscriptions
                        </h1>
                        <p className="text-emerald-400/80 font-bold uppercase tracking-widest text-[10px]">
                            Manage Recurring Refills & Patient Lock-in
                        </p>
                    </div>
                    <button onClick={triggerCron} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg font-bold text-xs transition-all">
                        <i className="fa-solid fa-play mr-2 text-emerald-400"></i> Trigger Refill Cron
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8">
                <div className="bg-[#1e293b] rounded-3xl border border-slate-700 shadow-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800 text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-700">
                                <th className="p-4 font-black">Patient</th>
                                <th className="p-4 font-black">Medicine</th>
                                <th className="p-4 font-black">Frequency</th>
                                <th className="p-4 font-black">Next Refill Date</th>
                                <th className="p-4 font-black">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.map((sub) => (
                                <tr key={sub.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-all">
                                    <td className="p-4 font-bold text-sm">{sub.user?.name || sub.userId}</td>
                                    <td className="p-4 font-black text-white">{sub.medicineName} (x{sub.quantity})</td>
                                    <td className="p-4 font-medium text-xs text-slate-400">{sub.frequency}</td>
                                    <td className="p-4 font-bold text-emerald-400">{new Date(sub.nextDate).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-black uppercase ${sub.status === 'Active' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {subscriptions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500 font-bold">No active subscriptions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

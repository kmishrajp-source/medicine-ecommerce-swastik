"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BroadcastLogsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        else if (status === "authenticated" && !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) router.push("/");
    }, [status]);

    useEffect(() => {
        fetchCampaigns();
        // Refresh every 10s if we are on this page
        const interval = setInterval(fetchCampaigns, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch("/api/admin/mass-whatsapp/logs");
            const data = await res.json();
            if (data.success) {
                setCampaigns(data.campaigns);
                // If a campaign is currently selected, refresh it to see progress
                if (selectedCampaign && data.campaigns.find(c => c.id === selectedCampaign.id)?.status === 'IN_PROGRESS') {
                    fetchLogs(selectedCampaign.id);
                }
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchLogs = async (campaignId) => {
        setLogsLoading(true);
        try {
            const res = await fetch(`/api/admin/mass-whatsapp/logs?campaignId=${campaignId}`);
            const data = await res.json();
            if (data.success) {
                setLogs(data.logs);
            }
        } catch (e) { console.error(e); }
        finally { setLogsLoading(false); }
    };

    if (status === "loading" || loading) return <div className="p-10 text-center text-white font-bold">Loading...</div>;

    return (
        <div className="bg-[#0f172a] min-h-screen pb-20 text-slate-200 font-sans">
            <div className="bg-[#1e293b] border-b border-slate-700 px-8 py-6 mb-8 shadow-xl flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-3">
                        <i className="fa-solid fa-list-check text-indigo-400"></i> Broadcast History
                    </h1>
                    <p className="text-slate-400 text-sm font-bold mt-1">Track delivery status for all your campaigns</p>
                </div>
                <Link href="/en/admin/mass-whatsapp" className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold transition-all text-sm">
                    <i className="fa-solid fa-arrow-left mr-2"></i> Back to Broadcaster
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Campaign List */}
                <div className="lg:col-span-1 bg-[#1e293b] rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-[700px]">
                    <div className="p-4 bg-slate-800 border-b border-slate-700 font-black uppercase text-xs tracking-widest text-slate-400">
                        Recent Campaigns
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {campaigns.length === 0 && <div className="p-4 text-center text-slate-500 font-bold text-sm">No campaigns yet.</div>}
                        
                        {campaigns.map(camp => (
                            <div 
                                key={camp.id} 
                                onClick={() => { setSelectedCampaign(camp); fetchLogs(camp.id); }}
                                className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${selectedCampaign?.id === camp.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-transparent bg-slate-800 hover:border-slate-600'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-sm text-white">
                                        {camp.audience === 'CUSTOMERS' ? '🛒 Customers' : camp.audience === 'RETAILERS' ? '🏪 Retailers' : '👥 Custom List'}
                                    </div>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${camp.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400 animate-pulse'}`}>
                                        {camp.status}
                                    </span>
                                </div>
                                <div className="flex gap-2 text-[10px] font-black text-slate-400 mb-2">
                                    <span className="bg-slate-700 px-2 py-0.5 rounded"><i className={camp.method === 'WHATSAPP' ? "fa-brands fa-whatsapp text-emerald-400" : "fa-solid fa-comment-sms text-blue-400"}></i> {camp.method}</span>
                                    <span>{new Date(camp.createdAt).toLocaleString()}</span>
                                </div>
                                
                                {/* Progress Bar */}
                                {camp.status === 'IN_PROGRESS' && (
                                    <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                                        <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${((camp.totalSent + camp.totalFailed) / (camp.totalSent + camp.totalFailed + camp.totalPending)) * 100}%` }}></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Detailed Logs */}
                <div className="lg:col-span-2 bg-[#1e293b] rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-[700px]">
                    {!selectedCampaign ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <i className="fa-solid fa-hand-pointer text-4xl mb-4 opacity-50"></i>
                            <div className="font-bold">Select a campaign on the left to view delivery logs</div>
                        </div>
                    ) : (
                        <>
                            <div className="p-6 bg-slate-800 border-b border-slate-700">
                                <h2 className="text-lg font-black text-white mb-4">Campaign Overview</h2>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-center">
                                        <div className="text-xs font-bold text-slate-400 mb-1 uppercase">Total Target</div>
                                        <div className="text-xl font-black text-white">{selectedCampaign.totalSent + selectedCampaign.totalFailed + selectedCampaign.totalPending}</div>
                                    </div>
                                    <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-center">
                                        <div className="text-xs font-bold text-emerald-500 mb-1 uppercase">Delivered</div>
                                        <div className="text-xl font-black text-emerald-400">{selectedCampaign.totalSent}</div>
                                    </div>
                                    <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center">
                                        <div className="text-xs font-bold text-red-500 mb-1 uppercase">Failed</div>
                                        <div className="text-xl font-black text-red-400">{selectedCampaign.totalFailed}</div>
                                    </div>
                                    <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-center">
                                        <div className="text-xs font-bold text-amber-500 mb-1 uppercase">Pending</div>
                                        <div className="text-xl font-black text-amber-400">{selectedCampaign.totalPending}</div>
                                    </div>
                                </div>
                                <div className="mt-4 p-3 bg-slate-900 rounded-xl text-xs font-mono text-slate-300 border border-slate-700">
                                    {selectedCampaign.message}
                                </div>
                            </div>
                            
                            <div className="p-4 border-b border-slate-700 font-black uppercase text-xs tracking-widest text-slate-400 flex justify-between">
                                <span>Detailed Delivery Logs</span>
                                {logsLoading && <i className="fa-solid fa-spinner fa-spin text-indigo-400"></i>}
                            </div>
                            
                            <div className="overflow-y-auto flex-1 p-0">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-800 sticky top-0">
                                        <tr>
                                            <th className="p-3 text-[10px] font-black uppercase text-slate-400">Time</th>
                                            <th className="p-3 text-[10px] font-black uppercase text-slate-400">Phone</th>
                                            <th className="p-3 text-[10px] font-black uppercase text-slate-400">Status</th>
                                            <th className="p-3 text-[10px] font-black uppercase text-slate-400">Provider ID / Error</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {logs.map(log => (
                                            <tr key={log.id} className="hover:bg-slate-800/50 text-sm">
                                                <td className="p-3 text-slate-400 text-xs">{new Date(log.sentAt).toLocaleTimeString()}</td>
                                                <td className="p-3 font-mono text-white">+{log.phone}</td>
                                                <td className="p-3">
                                                    {log.status === 'SENT' 
                                                        ? <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-black"><i className="fa-solid fa-check mr-1"></i> SENT</span>
                                                        : <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] font-black"><i className="fa-solid fa-xmark mr-1"></i> FAILED</span>
                                                    }
                                                </td>
                                                <td className="p-3 text-xs text-slate-400 truncate max-w-[200px]" title={log.providerMsgId || log.errorMessage}>
                                                    {log.status === 'SENT' ? log.providerMsgId : <span className="text-red-400">{log.errorMessage}</span>}
                                                </td>
                                            </tr>
                                        ))}
                                        {logs.length === 0 && !logsLoading && (
                                            <tr>
                                                <td colSpan="4" className="p-10 text-center text-slate-500">No logs generated yet. Wait a moment if campaign just started.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

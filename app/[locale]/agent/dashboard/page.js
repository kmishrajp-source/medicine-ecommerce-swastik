"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AgentDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState({ total: 0, contacted: 0, interested: 0, converted: 0 });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchLeads();
        }
    }, [status]);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/agent/leads");
            const data = await res.json();
            if (data.success) {
                setLeads(data.leads);
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Fetch Leads Error:", error);
        }
        setLoading(false);
    };

    const updateLead = async (leadId, newStatus, notes) => {
        setUpdating(leadId);
        try {
            const res = await fetch("/api/agent/lead/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leadId, status: newStatus, notes })
            });
            const data = await res.json();
            if (data.success) {
                fetchLeads(); // Refresh list
            }
        } catch (error) {
            console.error("Update Lead Error:", error);
        }
        setUpdating(null);
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Leads...</div>;

    return (
        <div className="agent-container bg-[#f8fafc] min-h-screen pb-20">
             {/* Header Section */}
            <div className="bg-white border-b border-slate-200 px-8 py-10 mb-8 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">
                             SSMS <span className="text-indigo-600">Agent Control</span>
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                            <i className="fa-solid fa-circle text-emerald-500 mr-2 animate-pulse"></i> 
                            Service Management: {session?.user?.name}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Leads', val: stats.total, color: 'slate' },
                        { label: 'Contacted', val: stats.contacted, color: 'blue' },
                        { label: 'Interested', val: stats.interested, color: 'amber' },
                        { label: 'Converted', val: stats.converted, color: 'emerald' }
                    ].map((s, idx) => (
                        <div key={idx} className={`bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col items-center justify-center transition-all hover:shadow-xl group`}>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-indigo-400">{s.label}</span>
                             <span className="text-5xl font-black text-slate-900 tracking-tighter">{s.val}</span>
                        </div>
                    ))}
                </div>

                {/* Tickets Grid */}
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 px-2 flex items-center gap-2">
                    <i className="fa-solid fa-ticket-simple text-indigo-500"></i> Active Service Tickets
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {leads.length === 0 ? (
                        <div className="col-span-full py-40 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                             <i className="fa-solid fa-inbox text-5xl text-slate-200 mb-6"></i>
                             <p className="text-slate-400 font-bold uppercase tracking-widest">No active tickets assigned to you</p>
                        </div>
                    ) : leads.map(lead => (
                        <div key={lead.id} className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-50 hover:shadow-2xl transition-all relative overflow-hidden group">
                            {/* Priority Indicator */}
                            <div className={`absolute top-0 left-0 w-2 h-full ${lead.status === 'new' ? 'bg-indigo-600' : lead.status === 'interested' ? 'bg-amber-500' : 'bg-slate-200'}`}></div>

                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${lead.serviceType === 'doctor' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {lead.serviceType}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ID: {lead.id.slice(-6)}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{lead.guestName || "Unidentified Lead"}</h3>
                                    <p className="text-slate-500 font-bold text-sm"><i className="fa-solid fa-location-dot mr-2 text-slate-300"></i>{lead.area || "City Core"}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                                        lead.status === 'new' ? 'border-indigo-100 bg-indigo-50 text-indigo-600' : 
                                        lead.status === 'contacted' ? 'border-blue-100 bg-blue-50 text-blue-600' : 
                                        lead.status === 'interested' ? 'border-amber-100 bg-amber-50 text-amber-600' : 
                                        lead.status === 'follow_up' ? 'border-purple-100 bg-purple-50 text-purple-600' :
                                        'border-emerald-100 bg-emerald-50 text-emerald-600'
                                    }`}>
                                        {lead.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <a href={`tel:${lead.guestPhone}`} className="flex items-center justify-center gap-3 p-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors">
                                    <i className="fa-solid fa-phone text-indigo-400"></i> Call Now
                                </a>
                                <a href={`https://wa.me/${lead.guestPhone.replace(/\D/g, '')}?text=Hi ${lead.guestName}, this is Swastik Medicare team...`} target="_blank" className="flex items-center justify-center gap-3 p-5 bg-emerald-50 text-emerald-700 border-2 border-emerald-100 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-emerald-100 transition-colors">
                                    <i className="fa-brands fa-whatsapp text-emerald-500"></i> WhatsApp
                                </a>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Update Stage</label>
                                    <select 
                                        disabled={updating === lead.id}
                                        value={lead.status}
                                        onChange={(e) => updateLead(lead.id, e.target.value, lead.notes)}
                                        className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all appearance-none"
                                    >
                                        <option value="new">🆕 New Ticket</option>
                                        <option value="contacted">📞 Contacted</option>
                                        <option value="interested">💡 Interested / Sales-Ready</option>
                                        <option value="follow_up">⏳ Follow-Up Required</option>
                                        <option value="converted">🚀 Converted / Payment Recvd</option>
                                        <option value="rejected">❌ Lost / Rejected</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Service Notes</label>
                                    <input 
                                        type="text" 
                                        placeholder="Type internal notes and press Enter..." 
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                updateLead(lead.id, lead.status, e.currentTarget.value);
                                                e.currentTarget.value = "";
                                            }
                                        }}
                                        className="w-full p-5 bg-indigo-50/50 border-2 border-transparent focus:border-indigo-200 rounded-3xl text-sm font-bold text-slate-600 outline-none transition-all placeholder:text-slate-400"
                                    />
                                    {lead.notes && (
                                        <p className="mt-4 p-4 bg-white border border-slate-100 rounded-2xl text-xs text-slate-500 italic">
                                            "{lead.notes}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Performance Banner */}
                <div className="mt-20 bg-slate-900 rounded-[50px] p-12 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">SSMS Performance <span className="text-indigo-400">Leaderboard</span></h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-8 max-w-lg mx-auto">
                            Transforming healthcare in Gorakhpur. You are helping {stats.converted} partners grow their digital presence.
                        </p>
                        <button className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 shadow-xl shadow-indigo-500/20">
                            View Competition
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

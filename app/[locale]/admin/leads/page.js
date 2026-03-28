"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

export default function AdminLeadsDashboard() {
    const { cartCount, toggleCart } = useCart();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/insurance/leads'); // Reusing existing admin lead API or creating new one
            const data = await res.json();
            if (data.success) {
                // Combine with generic leads if separate, or just use generic leads API
                const genericRes = await fetch('/api/sln/leads');
                const genericData = await genericRes.json();
                if (genericData.success) {
                    setLeads([...(data.leads || []), ...(genericData.leads || [])].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
                } else {
                    setLeads(data.leads || []);
                }
            }
        } catch (error) {
            console.error("Failed to fetch leads", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (leadId, newStatus, isInsurance = false) => {
        try {
            const endpoint = isInsurance ? '/api/admin/insurance/leads' : '/api/sln/leads';
            const res = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: leadId, status: newStatus, leadStatus: newStatus }) // Handling both field names
            });
            if (res.ok) {
                fetchLeads();
            }
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const filteredLeads = filter === "all" ? leads : leads.filter(l => (l.status || l.leadStatus) === filter);

    const stats = {
        total: leads.length,
        new: leads.filter(l => (l.status || l.leadStatus) === 'new').length,
        converted: leads.filter(l => (l.status || l.leadStatus) === 'Converted' || (l.status || l.leadStatus) === 'converted').length
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900">SLN Lead Dashboard</h1>
                        <p className="text-slate-500">Manage and track healthcare leads for Gorakhpur & beyond.</p>
                    </div>
                    
                    <div className="flex gap-4 p-1 bg-white rounded-2xl shadow-sm border border-slate-100">
                        {['all', 'new', 'contacted', 'converted'].map(f => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-blue-50 text-6xl"><i className="fa-solid fa-list-check"></i></div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative">Total Leads</p>
                        <h3 className="text-4xl font-black text-slate-900 relative">{stats.total}</h3>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-yellow-50 text-6xl"><i className="fa-solid fa-clock"></i></div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative">New Requests</p>
                        <h3 className="text-4xl font-black text-slate-900 relative">{stats.new}</h3>
                    </div>
                    <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 text-white/10 text-6xl"><i className="fa-solid fa-trophy"></i></div>
                        <p className="text-xs font-black text-white/60 uppercase tracking-widest mb-2 relative">Conversions</p>
                        <h3 className="text-4xl font-black relative">{stats.converted}</h3>
                    </div>
                </div>

                {/* Leads Table */}
                <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="py-20 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-slate-300"></i></div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Customer</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Service / Provider</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Details</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredLeads.map(lead => {
                                        const status = lead.status || lead.leadStatus;
                                        const isInsurance = !!lead.insurancePlanId;
                                        return (
                                            <tr key={lead.id} className="hover:bg-slate-50/50 transition-all group">
                                                <td className="px-8 py-6">
                                                    <p className="font-bold text-slate-900">{lead.guestName || lead.user?.name || "Customer"}</p>
                                                    <p className="text-xs text-slate-500">{lead.guestPhone || "No Phone"}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${isInsurance ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                            <i className={`fa-solid ${isInsurance ? 'fa-shield-halved' : 'fa-hand-holding-medical'}`}></i>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">{lead.serviceType || (isInsurance ? 'Insurance' : 'Gen. Lead')}</p>
                                                            <p className="text-[10px] text-slate-400 font-medium">ID: {lead.providerId || "Global"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-xs text-slate-600 italic line-clamp-1">{lead.details || lead.healthDetails || "No additional info"}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        status === 'new' ? 'bg-blue-100 text-blue-600' : 
                                                        status === 'contacted' ? 'bg-yellow-100 text-yellow-600' : 
                                                        (status === 'converted' || status === 'Converted') ? 'bg-green-100 text-green-600' : 
                                                        'bg-red-100 text-red-600'
                                                    }`}>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button 
                                                            onClick={() => updateStatus(lead.id, 'contacted', isInsurance)}
                                                            className="p-3 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-100" title="Mark Contacted"
                                                        >
                                                            <i className="fa-solid fa-phone"></i>
                                                        </button>
                                                        <button 
                                                            onClick={() => updateStatus(lead.id, 'converted', isInsurance)}
                                                            className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100" title="Convert Lead"
                                                        >
                                                            <i className="fa-solid fa-check"></i>
                                                        </button>
                                                         <button 
                                                            onClick={() => updateStatus(lead.id, 'rejected', isInsurance)}
                                                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100" title="Reject Lead"
                                                        >
                                                            <i className="fa-solid fa-xmark"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                        {!loading && filteredLeads.length === 0 && (
                            <div className="py-20 text-center font-bold text-slate-300">No leads found for this filter.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

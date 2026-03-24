"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";

export default function PublisherDashboard() {
    const { cartCount, toggleCart } = useCart();
    const { data: session } = useSession();
    
    const [insuranceLeads, setInsuranceLeads] = useState([]);
    const [slnLeads, setSlnLeads] = useState([]);
    const [stats, setStats] = useState({ totalLeads: 0, totalEarned: 0, activeLeads: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("insurance");

    const getReferralLinks = () => {
        if (!session?.user?.id) return { insurance: "", directory: "" };
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        return {
            insurance: `${origin}/medical-insurance?pubId=${session.user.id}`,
            directory: `${origin}/hospitals?pubId=${session.user.id}`
        };
    };

    const referralLinks = getReferralLinks();

    useEffect(() => {
        if (session?.user?.id) {
            fetchPublisherData();
        }
    }, [session]);

    const fetchPublisherData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/publisher/leads`);
            const data = await res.json();
            if (data.success) {
                setInsuranceLeads(data.insuranceLeads || []);
                setSlnLeads(data.slnLeads || []);
                
                // Calculate stats
                const insuranceEarned = (data.insuranceLeads || []).reduce((acc, l) => acc + (l.paymentStatus === 'Paid' ? (l.commissionEarned * 0.5) : 0), 0);
                const slnEarned = (data.slnLeads || []).reduce((acc, l) => acc + (l.commissionEarned || 0), 0);
                
                setStats({
                    totalLeads: (data.insuranceLeads?.length || 0) + (data.slnLeads?.length || 0),
                    totalEarned: insuranceEarned + slnEarned,
                    activeLeads: (data.insuranceLeads?.filter(l => l.paymentStatus === 'Pending').length || 0) + (data.slnLeads?.filter(l => l.status === 'new').length || 0)
                });
            }
        } catch (error) {
            console.error("Failed to fetch publisher data", error);
        } finally {
            setLoading(false);
        }
    };

    const copyLink = (link) => {
        navigator.clipboard.writeText(link);
        alert("Referral link copied!");
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900">Publisher Dashboard</h1>
                        <p className="text-slate-500">Track Gorkhpur Directory referrals and Insurance earnings.</p>
                    </div>
                </div>

                {/* Referral Links Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                         <div className="flex items-center gap-4 mb-6">
                            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><i className="fa-solid fa-shield-halved"></i></div>
                            <div>
                                <h4 className="font-black text-slate-900 leading-tight">Medical Insurance</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">High Commission Plans</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-dashed border-slate-200">
                             <p className="flex-1 text-[10px] font-mono text-slate-400 truncate">{referralLinks.insurance}</p>
                             <button onClick={() => copyLink(referralLinks.insurance)} className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-xl">COPY LINK</button>
                         </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                         <div className="flex items-center gap-4 mb-6">
                            <div className="bg-green-50 p-3 rounded-2xl text-green-600"><i className="fa-solid fa-hospital"></i></div>
                            <div>
                                <h4 className="font-black text-slate-900 leading-tight">Gorakhpur Directory</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hospitals • Doctors • Retailers</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-dashed border-slate-200">
                             <p className="flex-1 text-[10px] font-mono text-slate-400 truncate">{referralLinks.directory}</p>
                             <button onClick={() => copyLink(referralLinks.directory)} className="bg-green-600 text-white text-[10px] font-black px-4 py-2 rounded-xl">COPY LINK</button>
                         </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-blue-50 text-6xl"><i className="fa-solid fa-users"></i></div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2 relative">Total Referrals</p>
                        <h3 className="text-4xl font-black text-slate-900 relative">{stats.totalLeads}</h3>
                    </div>
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-white/5 text-6xl"><i className="fa-solid fa-wallet"></i></div>
                        <p className="text-sm font-black text-white/60 uppercase tracking-widest mb-2 relative">Total Earnings</p>
                        <h3 className="text-4xl font-black relative">₹{stats.totalEarned.toLocaleString()}</h3>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 text-red-50 text-6xl"><i className="fa-solid fa-clock"></i></div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2 relative">Pending Action</p>
                        <h3 className="text-4xl font-black text-slate-900 relative">{stats.activeLeads}</h3>
                    </div>
                </div>

                {/* Tabs & Table */}
                <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center gap-8">
                        <button 
                            onClick={() => setActiveTab('insurance')}
                            className={`text-sm font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'insurance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-300 hover:text-slate-500'}`}
                        >
                            Insurance Leads
                        </button>
                        <button 
                            onClick={() => setActiveTab('directory')}
                            className={`text-sm font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'directory' ? 'border-green-600 text-green-600' : 'border-transparent text-slate-300 hover:text-slate-500'}`}
                        >
                            Directory Leads
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="py-20 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-slate-300"></i></div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Customer</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">{activeTab === 'insurance' ? 'Plan Details' : 'Service Requested'}</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Date</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 text-right">Commission</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(activeTab === 'insurance' ? insuranceLeads : slnLeads).map(lead => (
                                        <tr key={lead.id} className="hover:bg-slate-50/50 transition-all">
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-slate-900 text-sm">{lead.guestName || "Referral User"}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{lead.guestPhone || "No Contact"}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                {activeTab === 'insurance' ? (
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-xs">{lead.plan?.name}</p>
                                                        <p className="text-[10px] text-slate-400 uppercase font-black">{lead.plan?.company?.name}</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-xs">
                                                            <i className={`fa-solid ${lead.serviceType === 'doctor' ? 'fa-user-doctor' : (lead.serviceType === 'hospital' ? 'fa-hospital' : 'fa-shop')}`}></i>
                                                        </div>
                                                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">{lead.serviceType}</p>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase">
                                                {new Date(lead.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                    (lead.paymentStatus === 'Paid' || lead.status === 'converted') ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                                }`}>
                                                    {lead.paymentStatus || lead.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <p className={`font-black text-sm ${(lead.paymentStatus === 'Paid' || lead.status === 'converted') ? 'text-blue-600' : 'text-slate-300'}`}>
                                                    ₹{activeTab === 'insurance' ? (lead.commissionEarned * 0.5).toFixed(0) : (lead.commissionEarned || 0)}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                    {(activeTab === 'insurance' ? insuranceLeads : slnLeads).length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-20 text-center font-bold text-slate-300">No {activeTab} leads found yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

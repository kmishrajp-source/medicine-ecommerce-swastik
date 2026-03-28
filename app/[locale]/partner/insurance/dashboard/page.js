"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function InsurancePartnerDashboard() {
    const { cartCount, toggleCart } = useCart();
    const { data: session } = useSession();
    const router = useRouter();
    
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("leads"); // leads, directory

    useEffect(() => {
        if (session) {
            fetchInsuranceData();
        }
    }, [session]);

    const fetchInsuranceData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/partner/insurance/data');
            const result = await res.json();
            if (result.success) {
                setData(result);
            } else {
                console.error("Dashboard error:", result.error);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><i className="fa-solid fa-spinner fa-spin text-4xl text-blue-500"></i></div>;
    if (!data) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500 font-bold">Access Denied: Insurance Profile Required</div>;

    const stats = {
        totalLeads: data.leads?.length || 0,
        converted: data.leads?.filter(l => l.paymentStatus === 'Paid').length || 0,
        activePlans: data.directory?.filter(p => p.companyId === data.company.id).length || 0
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><i className="fa-solid fa-building-shield text-xl"></i></div>
                             <div>
                                <h1 className="text-3xl font-black text-slate-900">{data.company.name}</h1>
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Verified Insurance Provider</p>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-blue-50 text-6xl"><i className="fa-solid fa-users-viewfinder"></i></div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2 relative">Total Enquiries</p>
                        <h3 className="text-4xl font-black text-slate-900 relative">{stats.totalLeads}</h3>
                    </div>
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-white/5 text-6xl"><i className="fa-solid fa-file-invoice-dollar"></i></div>
                        <p className="text-sm font-black text-white/60 uppercase tracking-widest mb-2 relative">Policy Conversions</p>
                        <h3 className="text-4xl font-black relative">{stats.converted}</h3>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 text-green-50 text-6xl"><i className="fa-solid fa-layer-group"></i></div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2 relative">Live Plans</p>
                        <h3 className="text-4xl font-black text-slate-900 relative">{stats.activePlans}</h3>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-8 mb-8 border-b border-slate-200">
                    <button 
                        onClick={() => setActiveTab('leads')}
                        className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'leads' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Customer Leads
                    </button>
                    <button 
                        onClick={() => setActiveTab('directory')}
                        className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'directory' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Insurance Directory
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                    {activeTab === 'leads' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Customer</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Selected Plan</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Date</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 text-right">Commission</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {data.leads.length === 0 ? (
                                        <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-bold">No leads generated yet.</td></tr>
                                    ) : data.leads.map(lead => (
                                        <tr key={lead.id} className="hover:bg-slate-50/50 transition-all">
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-slate-900 text-sm">{lead.guestName || "Anonymous"}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{lead.guestPhone}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-slate-800 text-xs">{lead.plan?.name}</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-black">{lead.plan?.coverageType}</p>
                                            </td>
                                            <td className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase">
                                                {new Date(lead.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                    lead.paymentStatus === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                                }`}>
                                                    {lead.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <p className="font-black text-sm text-slate-600">₹{lead.commissionEarned?.toFixed(0)}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">Market Overview: Insurance Directory</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {data.directory.map(plan => (
                                    <div key={plan.id} className={`p-6 rounded-3xl border-2 transition-all ${plan.companyId === data.company.id ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 bg-white'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center p-2">
                                                <img src={plan.company.logoUrl || "https://placeholder.com/company"} className="max-h-full max-w-full grayscale opacity-50" alt={plan.company.name} />
                                            </div>
                                            {plan.companyId === data.company.id && <span className="text-[8px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full">YOUR PLAN</span>}
                                        </div>
                                        <h4 className="font-black text-slate-900 text-sm mb-1">{plan.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">{plan.company.name}</p>
                                        
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                            <div>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase">Premium</p>
                                                <p className="font-black text-slate-900">₹{plan.premium.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-bold text-slate-400 uppercase">Commission</p>
                                                <p className="font-black text-green-600">{plan.commissionRate}%</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

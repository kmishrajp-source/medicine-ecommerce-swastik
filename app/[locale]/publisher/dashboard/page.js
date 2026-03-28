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
                
                setStats({
                    totalLeads: (data.insuranceLeads?.length || 0) + (data.slnLeads?.length || 0),
                    totalEarned: data.walletBalance || 0,
                    activeLeads: (data.insuranceLeads?.filter(l => l.paymentStatus === 'Pending').length || 0) + (data.slnLeads?.filter(l => l.status === 'new').length || 0)
                });
            }
        } catch (error) {
            console.error("Failed to fetch publisher data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        if (stats.totalEarned < 500) {
            alert("Minimum withdrawal is ₹500");
            return;
        }

        const res = await fetch("/api/publisher/withdraw", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: stats.totalEarned })
        });

        const data = await res.json();
        if (data.success) {
            alert("Withdrawal request sent for admin approval!");
            fetchPublisherData();
        } else {
            alert(data.error || "Failed to submit withdrawal request");
        }
    };

    const getReferralLink = () => {
        if (typeof window === 'undefined') return '';
        const origin = window.location.origin;
        const ref = session?.user?.referralCode || session?.user?.id || 'REF123';
        return `${origin}?ref=${ref}`;
    };

    const referralLink = getReferralLink();

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>Publisher Dashboard</h1>
                        <p style={{ color: '#64748b' }}>Track referrals and earn commission on Gorakhpur's health network.</p>
                    </div>
                    <div style={{ padding: '15px 25px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #e2e8f0' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wallet Balance</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>₹{stats.totalEarned.toLocaleString()}</div>
                        </div>
                        <div style={{ width: '1px', height: '30px', background: '#e2e8f0' }}></div>
                        <button 
                            onClick={handleWithdraw}
                            disabled={stats.totalEarned < 500}
                            style={{ padding: '8px 15px', background: stats.totalEarned >= 500 ? '#4338ca' : '#cbd5e1', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: stats.totalEarned >= 500 ? 'pointer' : 'not-allowed', fontSize: '0.85rem' }}
                        >
                            Withdraw
                        </button>
                    </div>
                </div>

                {/* Referral Link Card */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '40px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#334155' }}>Your Main Referral Link</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ fontSize: '0.7rem', color: '#4338ca', fontWeight: 'black', background: '#e0e7ff', padding: '5px 12px', borderRadius: '20px', textTransform: 'uppercase' }}>10% Payout</span>
                            <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 'black', background: '#d1fae5', padding: '5px 12px', borderRadius: '20px', textTransform: 'uppercase' }}>Instant Credit</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <input 
                            readOnly 
                            value={referralLink} 
                            style={{ flex: 1, padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#475569', fontWeight: '500' }}
                        />
                        <button 
                            onClick={() => { navigator.clipboard.writeText(referralLink); alert("Link Copied!"); }}
                            style={{ padding: '0 30px', background: '#334155', color: 'white', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.2s shadow' }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#1e293b'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#334155'}
                        >
                            <i className="fa-solid fa-copy" style={{ marginRight: '8px' }}></i> Copy Link
                        </button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl"><i className="fa-solid fa-link"></i></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Leads</p>
                            <h3 className="text-2xl font-black text-slate-900">{stats.totalLeads}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6">
                        <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-xl"><i className="fa-solid fa-check-double"></i></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conversions</p>
                            <h3 className="text-2xl font-black text-slate-900">{stats.totalLeads - stats.activeLeads}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6">
                        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl"><i className="fa-solid fa-clock-rotate-left"></i></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Payout</p>
                            <h3 className="text-2xl font-black text-slate-900">{stats.activeLeads}</h3>
                        </div>
                    </div>
                </div>

                {/* Tabs & Table */}
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center gap-10">
                        <button 
                            onClick={() => setActiveTab('insurance')}
                            className={`text-[11px] font-black uppercase tracking-widest pb-3 border-b-2 transition-all ${activeTab === 'insurance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-300 hover:text-slate-500'}`}
                        >
                            Insurance Leads
                        </button>
                        <button 
                            onClick={() => setActiveTab('directory')}
                            className={`text-[11px] font-black uppercase tracking-widest pb-3 border-b-2 transition-all ${activeTab === 'directory' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-300 hover:text-slate-500'}`}
                        >
                            Directory Leads
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="py-20 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-indigo-100"></i></div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-wider">Customer Info</th>
                                        <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-wider">Product/Service</th>
                                        <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-wider">Referral Date</th>
                                        <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-wider">Reward Status</th>
                                        <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-wider text-right">Commission</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(activeTab === 'insurance' ? insuranceLeads : slnLeads).length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-20 text-center font-bold text-slate-300">No {activeTab} activity yet.</td>
                                        </tr>
                                    ) : (activeTab === 'insurance' ? insuranceLeads : slnLeads).map(lead => (
                                        <tr key={lead.id} className="hover:bg-slate-50/50 transition-all">
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-slate-900 text-sm">{lead.guestName || "Referral"}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{lead.guestPhone || "Contact Hidden"}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                {activeTab === 'insurance' ? (
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-xs">{lead.plan?.name}</p>
                                                        <p className="text-[10px] text-slate-400 uppercase font-black">{lead.plan?.company?.name}</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-400 text-[10px]">
                                                            <i className={`fa-solid ${lead.serviceType === 'doctor' ? 'fa-user-doctor' : (lead.serviceType === 'hospital' ? 'fa-hospital' : 'fa-shop')}`}></i>
                                                        </div>
                                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{lead.serviceType}</p>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-[10px] font-bold text-slate-400">
                                                {new Date(lead.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                                    (lead.paymentStatus === 'Paid' || lead.status === 'completed' || lead.status === 'converted') ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                                                }`}>
                                                    {lead.paymentStatus || lead.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <p className={`font-black text-sm ${(lead.paymentStatus === 'Paid' || lead.status === 'completed' || lead.status === 'converted') ? 'text-indigo-600' : 'text-slate-300'}`}>
                                                    ₹{activeTab === 'insurance' ? (lead.commissionEarned * 0.5).toFixed(0) : (lead.commissionEarned || 0)}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

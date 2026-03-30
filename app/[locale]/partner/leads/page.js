"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function ProviderLeadsDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { cartCount, toggleCart } = useCart();
    
    const [leads, setLeads] = useState([]);
    const [hasSubscription, setHasSubscription] = useState(false);
    const [commissionOwed, setCommissionOwed] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeLead, setActiveLead] = useState(null);
    const [orderValue, setOrderValue] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/partner/leads");
        } else if (status === "authenticated") {
            fetchData();
        }
    }, [status]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/partner/leads");
            const data = await res.json();
            if (data.success) {
                setLeads(data.leads || []);
                setHasSubscription(data.hasSubscription);
                setCommissionOwed(data.commissionOwed || 0);
            }
        } catch (error) {
            console.error("Dashboard Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async () => {
        try {
            const res = await fetch("/api/partner/subscribe", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                alert("Subscription Active! You now have full access to marketplace leads.");
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateStatus = async (leadId, newStatus) => {
        const lead = leads.find(l => l.id === leadId);
        
        // If moving to Order Confirmed or Delivered and no amount has been logged, we need the Order Value!
        if ((newStatus === 'Order Confirmed' || newStatus === 'Delivered') && !lead.amount) {
            setActiveLead(leadId);
            setUpdatingStatus(newStatus);
            return; // Prompting user for Order Value
        }

        executeStatusUpdate(leadId, newStatus, lead.amount);
    };

    const submitOrderValueAndUpdate = (e) => {
        e.preventDefault();
        if (!orderValue || isNaN(orderValue)) return alert("Enter a valid order value");
        executeStatusUpdate(activeLead, updatingStatus, parseFloat(orderValue));
    };

    const executeStatusUpdate = async (leadId, newStatus, currentOrderValue) => {
        try {
            const payload = { leadId, newStatus, orderValue: currentOrderValue };
            const res = await fetch("/api/partner/leads", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                alert(`Lead Updated! ${data.commissionLogged ? '10% Commission logged to pending payments.' : ''}`);
                setActiveLead(null);
                setOrderValue("");
                setUpdatingStatus("");
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const STAGES = ["new", "contacted", "Order Confirmed", "Delivered", "closed"];
    const STAGE_LABELS = {
        "new": "New Leads",
        "contacted": "Contacted",
        "Order Confirmed": "Confirm & Prepare",
        "Delivered": "Delivered",
        "closed": "Closed / Cancelled"
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><i className="fa-solid fa-spinner fa-spin text-3xl text-indigo-600"></i></div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            <main className="max-w-7xl mx-auto px-6 pt-32">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Partner Lead Marketplace</h1>
                        <p className="text-sm font-bold text-slate-500 mt-1">Manage local service requests routed to you.</p>
                    </div>
                    
                    {/* Billing Widget */}
                    {hasSubscription && (
                        <div className="bg-white px-6 py-4 rounded-2xl border-2 border-slate-100 shadow-sm flex items-center gap-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Commission Owed (10%)</p>
                                <p className="text-2xl font-black text-red-500 leading-none">₹{commissionOwed.toFixed(2)}</p>
                            </div>
                            <button className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-red-500 transition-colors">
                                Pay Now
                            </button>
                        </div>
                    )}
                </div>

                {!hasSubscription ? (
                    <div className="relative rounded-[2rem] overflow-hidden bg-white border border-slate-200">
                        {/* Fake Blurred Setup for Unsubscribed */}
                        <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl mb-6 shadow-inner">
                                <i className="fa-solid fa-lock"></i>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Unlock Your Local Leads</h2>
                            <p className="text-slate-600 font-medium max-w-lg mx-auto mb-8">
                                Connect with hundreds of patients searching for your services in Gorakhpur. Subscribe to our Verified Partner model for just ₹500/month.
                            </p>
                            <div className="flex gap-4">
                                <button onClick={handleSubscribe} className="bg-indigo-600 text-white font-black px-8 py-4 rounded-xl text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all uppercase tracking-widest flex items-center gap-2">
                                    <i className="fa-solid fa-crown text-amber-300"></i> Subscribe Now (₹500/mo)
                                </button>
                                <button disabled className="bg-white text-slate-400 font-black px-8 py-4 rounded-xl text-sm border-2 border-slate-200 uppercase tracking-widest">
                                    I am not interested
                                </button>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 mt-6 uppercase tracking-widest">Payment triggers an exact database record to grant access.</p>
                        </div>

                        {/* Blurred Fake Data behind */}
                        <div className="p-8 opacity-40 select-none pointer-events-none filter blur-[2px]">
                            <div className="grid grid-cols-3 gap-6">
                                {[1,2,3].map(i => (
                                    <div key={i} className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 h-64"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 overflow-x-auto pb-8 snap-x">
                        {/* Full Kanban Board for Subscribed Providers */}
                        {STAGES.map(stage => (
                            <div key={stage} className="bg-slate-100 rounded-[2rem] p-4 min-w-[280px] snap-center">
                                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4 px-2 flex justify-between items-center">
                                    {STAGE_LABELS[stage]} 
                                    <span className="bg-white text-slate-400 px-2 py-0.5 rounded-full text-[10px]">{leads.filter(l => l.status === stage).length}</span>
                                </h3>

                                <div className="space-y-4">
                                    {leads.filter(l => l.status === stage).map(lead => (
                                        <div key={lead.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full">{lead.serviceType}</span>
                                                <span className="text-[10px] font-bold text-slate-400">{new Date(lead.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <h4 className="font-bold text-slate-900 leading-tight mb-1">{lead.guestName}</h4>
                                            <p className="text-xs font-bold text-slate-500 mb-4"><i className="fa-brands fa-whatsapp text-emerald-500 mr-1"></i> {lead.guestPhone}</p>
                                            
                                            {lead.notes && (
                                                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-50/50 mb-4">
                                                    <p className="text-[11px] font-medium text-indigo-900 line-clamp-2">"{lead.notes}"</p>
                                                </div>
                                            )}

                                            {lead.amount && (
                                                <div className="bg-amber-50 rounded-xl p-3 mb-4 flex justify-between items-center">
                                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Order Value</span>
                                                    <span className="text-sm font-black text-amber-700">₹{lead.amount}</span>
                                                </div>
                                            )}

                                            <div className="pt-3 border-t border-slate-50 flex flex-wrap gap-2">
                                                {stage === 'new' && (
                                                    <button onClick={() => handleUpdateStatus(lead.id, 'contacted')} className="w-full bg-slate-900 text-white text-[10px] font-black py-2 rounded-lg uppercase tracking-widest">Mark Contacted</button>
                                                )}
                                                {stage === 'contacted' && (
                                                    <button onClick={() => handleUpdateStatus(lead.id, 'Order Confirmed')} className="w-full bg-emerald-500 text-white text-[10px] font-black py-2 rounded-lg uppercase tracking-widest">Confirm Order</button>
                                                )}
                                                {stage === 'Order Confirmed' && (
                                                    <button onClick={() => handleUpdateStatus(lead.id, 'Delivered')} className="w-full bg-indigo-600 text-white text-[10px] font-black py-2 rounded-lg uppercase tracking-widest">Mark Delivered</button>
                                                )}
                                                {stage !== 'closed' && stage !== 'Delivered' && (
                                                    <button onClick={() => handleUpdateStatus(lead.id, 'closed')} className="w-full bg-white text-slate-400 border border-slate-200 text-[10px] font-black py-2 rounded-lg uppercase tracking-widest hover:bg-slate-50">Close / Reject</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {leads.filter(l => l.status === stage).length === 0 && (
                                        <div className="text-center py-8 text-slate-400 text-xs font-bold">No leads here</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Order Value Prompt Modal */}
            {activeLead && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <form onSubmit={submitOrderValueAndUpdate} className="bg-white max-w-sm w-full rounded-[2rem] p-8 shadow-2xl relative animate-in zoom-in duration-300">
                        <button type="button" onClick={() => setActiveLead(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                            <i className="fa-solid fa-xmark text-slate-500"></i>
                        </button>
                        
                        <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center text-2xl mb-6 shadow-inner">
                            <i className="fa-solid fa-indian-rupee-sign"></i>
                        </div>
                        
                        <h3 className="text-xl font-black text-slate-900 mb-2">Record Order Value</h3>
                        <p className="text-sm font-bold text-slate-500 mb-6 leading-snug">To proceed to '{updatingStatus}', please enter the final estimated or actual order amount. <br/>(10% marketplace commission will be assigned).</p>
                        
                        <div className="relative mb-8">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                            <input 
                                type="number" 
                                value={orderValue} 
                                onChange={(e) => setOrderValue(e.target.value)} 
                                placeholder="0.00" 
                                required
                                className="w-full py-4 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 font-black text-slate-900 text-lg transition-colors"
                            />
                        </div>

                        <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">
                            Save & Proceed
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

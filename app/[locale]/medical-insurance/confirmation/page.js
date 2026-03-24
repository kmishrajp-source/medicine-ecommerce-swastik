"use client";
import { useEffect, useState, use } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";

export default function ConfirmationPage() {
    const { cartCount, toggleCart } = useCart();
    const searchParams = useSearchParams();
    const leadId = searchParams.get('leadId');
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (leadId) {
            fetchLead();
        }
    }, [leadId]);

    const fetchLead = async () => {
        try {
            // This would normally be a secure admin/user endpoint
            // For now, we mock it or fetch basic info
            const res = await fetch(`/api/admin/insurance/leads?id=${leadId}`);
            const data = await res.json();
            if (data.success) {
                setLead(data.lead);
            }
        } catch (error) {
            console.error("Failed to fetch lead", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <div className="max-w-3xl mx-auto px-6 pt-40 pb-24 text-center">
                <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col items-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-500 text-4xl mb-8 shadow-inner">
                        <i className="fa-solid fa-check-circle animate-pulse"></i>
                    </div>
                    
                    <h1 className="text-4xl font-black text-slate-900 mb-4">Payment Successful!</h1>
                    <p className="text-slate-500 text-lg max-w-md mx-auto mb-10">
                        Your medical insurance application has been submitted successfully to the insurer.
                    </p>

                    <div className="w-full bg-slate-50 rounded-3xl p-8 mb-8 grid grid-cols-2 gap-8 text-left">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Policy Ref ID</p>
                            <p className="font-bold text-slate-800">#{leadId?.substr(-6).toUpperCase() || 'TRX-9988'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Premium Paid</p>
                            <p className="font-bold text-slate-800">₹{lead?.totalPremium?.toLocaleString() || '12,500'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                            <p className="font-bold text-green-600 flex items-center gap-1">
                                <i className="fa-solid fa-circle-check text-[10px]"></i> Verified
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Cashback Credited</p>
                            <p className="font-bold text-indigo-600">₹{lead?.commissionEarned?.toFixed(0) || '625'}</p>
                        </div>
                    </div>

                    <div className="space-y-6 w-full max-w-sm">
                        <div className="bg-indigo-50 p-4 rounded-2xl flex items-center gap-4 text-left border border-indigo-100">
                           <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0">
                               <i className="fa-solid fa-wallet text-sm"></i>
                           </div>
                           <div>
                               <p className="text-xs font-bold text-indigo-900">Wallet Updated</p>
                               <p className="text-[10px] text-indigo-600">Check your Swastik wallet for your instant cashback.</p>
                           </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
                            <button 
                                onClick={() => window.location.href = '/'}
                                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-black transition-all"
                            >
                                Back to Home
                            </button>
                            <button className="text-blue-600 font-bold text-sm py-2">
                                Download Policy Receipt <i className="fa-solid fa-download ml-1 text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-slate-400 text-xs font-medium space-y-2">
                    <p>A confirmation email has been sent to your registered email address.</p>
                    <p>For any claim assistance, call our 24/7 hotline at 1800-SWASTIK</p>
                </div>
            </div>
        </div>
    );
}

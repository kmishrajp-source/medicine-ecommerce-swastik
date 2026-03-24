"use client";
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import RazorpayPayment from '@/components/RazorpayPayment';

export default function JoinSwastik() {
    const { cartCount, toggleCart } = useCart();
    const [selectedPlan, setSelectedPlan] = useState(null);

    const plans = [
        {
            id: 'basic',
            name: 'Basic Partner',
            price: 299,
            features: [
                'Directory Listing',
                'Basic CRM Access',
                'WhatsApp Lead Alerts',
                'Standard Support'
            ],
            color: '#6366f1'
        },
        {
            id: 'featured',
            name: 'Featured Partner',
            price: 999,
            features: [
                'Top-of-Search Listing',
                'Full CRM Dashboard',
                'Bulk WhatsApp Outreach',
                'Dedicated Account Manager',
                'Verified Badge'
            ],
            color: '#4f46e5',
            popular: true
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            {/* Hero Section */}
            <div className="pt-32 pb-24 px-6 text-center bg-white border-b border-slate-100 relative overflow-hidden">
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                        <i className="fa-solid fa-bolt-lightning text-amber-500 animate-pulse"></i>
                        The Future of Practice Growth
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tighter">
                        Verified Contact Data. <br/>
                        <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Real Results.</span>
                    </h1>
                    <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                        Stop chasing dead-ends. Reach the right patients and referral partners with Swastik Intelligence—the most intuitive healthcare data platform in Gorakhpur.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="#pricing" className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-sm shadow-2xl hover:bg-black hover:-translate-y-1 transition-all">
                            Launch Your Intelligence Account
                        </a>
                        <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-widest">
                            <i className="fa-solid fa-shield-check text-emerald-500"></i>
                            800+ Verified Records
                        </div>
                    </div>
                </div>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-50/30 to-transparent"></div>
            </div>

            {/* Pricing Section */}
            <div className="py-24 px-6 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {plans.map((plan) => (
                        <div 
                            key={plan.id}
                            className={`relative bg-white p-10 rounded-[3rem] border-2 transition-all duration-300 ${plan.popular ? 'border-indigo-600 shadow-2xl scale-105' : 'border-slate-100 shadow-lg'}`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-10 -translate-y-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                                    Recommended
                                </div>
                            )}
                            
                            <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-2 mb-8">
                                <span className="text-5xl font-black text-slate-900">₹{plan.price}</span>
                                <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">/ month</span>
                            </div>

                            <div className="space-y-4 mb-10">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px]">
                                            <i className="fa-solid fa-check"></i>
                                        </div>
                                        <span className="text-slate-600 font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto">
                                <RazorpayPayment 
                                    amount={plan.price} 
                                    type="PLAN_PURCHASE" 
                                    targetId={plan.id}
                                    onSuccess={() => {
                                        alert("Welcome to the family!");
                                        window.location.href = '/dashboard';
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Value Props */}
            <div className="bg-slate-900 py-32 px-6 relative overflow-hidden">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
                    <div className="text-white">
                        <div className="w-16 h-16 bg-white/5 rounded-3xl mb-8 flex items-center justify-center mx-auto text-indigo-400 text-2xl group hover:bg-white hover:text-slate-900 transition-all">
                            <i className="fa-solid fa-magnifying-glass-chart"></i>
                        </div>
                        <h4 className="text-xl font-black mb-4">Lead Intelligence</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">Not just a list. We provide intent-based scoring so you focus only on patients ready to book.</p>
                    </div>
                    <div className="text-white">
                        <div className="w-16 h-16 bg-white/5 rounded-3xl mb-8 flex items-center justify-center mx-auto text-indigo-400 text-2xl group hover:bg-white hover:text-slate-900 transition-all">
                            <i className="fa-solid fa-address-card"></i>
                        </div>
                        <h4 className="text-xl font-black mb-4">Verified Data</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">Every contact is double-verified by our local field agents for 100% accuracy and trust.</p>
                    </div>
                    <div className="text-white">
                        <div className="w-16 h-16 bg-white/5 rounded-3xl mb-8 flex items-center justify-center mx-auto text-indigo-400 text-2xl group hover:bg-white hover:text-slate-900 transition-all">
                            <i className="fa-solid fa-code-merge"></i>
                        </div>
                        <h4 className="text-xl font-black mb-4">CRM Integration</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">Seamlessly export verified data to your existing workflows or use our built-in conversion engine.</p>
                    </div>
                </div>
                {/* Visual Flair */}
                <div className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
            </div>

            {/* Footer Minimal */}
            <div className="py-12 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                Swastik Medicare &copy; 2026 • Gorakhpur Healthcare Revolution
            </div>
        </div>
    );
}

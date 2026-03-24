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
            <div className="pt-32 pb-20 px-6 text-center bg-white border-b border-slate-100">
                <div className="max-w-4xl mx-auto">
                    <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block">
                        Scale Your Practice
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
                        Join Gorakhpur's Largest <br/>
                        <span className="text-indigo-600">Health Network</span>
                    </h1>
                    <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
                        Convert more leads, manage patient records, and automate your clinic's outreach with Swastik Medicare.
                    </p>
                </div>
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
            <div className="bg-slate-900 py-24 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div className="text-white">
                        <div className="text-indigo-400 text-4xl mb-6"><i className="fa-solid fa-bolt"></i></div>
                        <h4 className="text-xl font-black mb-4">Instant Setup</h4>
                        <p className="text-slate-400 text-sm">Get listed in the Gorakhpur Directory within 5 minutes of payment.</p>
                    </div>
                    <div className="text-white">
                        <div className="text-indigo-400 text-4xl mb-6"><i className="fa-solid fa-robot"></i></div>
                        <h4 className="text-xl font-black mb-4">AI Automation</h4>
                        <p className="text-slate-400 text-sm">Automated WhatsApp follow-ups that convert leads while you sleep.</p>
                    </div>
                    <div className="text-white">
                        <div className="text-indigo-400 text-4xl mb-6"><i className="fa-solid fa-chart-line"></i></div>
                        <h4 className="text-xl font-black mb-4">Real-time CRM</h4>
                        <p className="text-slate-400 text-sm">Track every conversion and leads lifecycle in one dashboard.</p>
                    </div>
                </div>
            </div>

            {/* Footer Minimal */}
            <div className="py-12 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                Swastik Medicare &copy; 2026 • Gorakhpur Healthcare Revolution
            </div>
        </div>
    );
}

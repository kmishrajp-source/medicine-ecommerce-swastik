"use client";
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

export default function DiabetesCareLanding() {
    const { cartCount, toggleCart } = useCart();
    
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [status, setStatus] = useState("idle"); // idle, loading, success, error
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("loading");
        
        try {
            const res = await fetch("/api/campaign-leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, campaign: "DIABETES_GORAKHPUR" })
            });
            const data = await res.json();
            
            if (data.success) {
                setStatus("success");
                setMessage(data.message || "Success! Check your WhatsApp for your 20% OFF Coupon and Diet Consultation.");
            } else {
                setStatus("error");
                setMessage(data.error || "Failed to submit. Please try again.");
            }
        } catch (err) {
            setStatus("error");
            setMessage("A network error occurred. Please try again.");
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            {/* Hero Section */}
            <div className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-white">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
                        alt="Medical Background" 
                        className="w-full h-full object-cover opacity-[0.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-block bg-emerald-100 text-emerald-700 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider mb-6 border border-emerald-200 shadow-sm">
                            <i className="fa-solid fa-location-dot mr-2"></i> Exclusive for Gorakhpur Residents
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
                            Take Control of Your <span className="text-emerald-600 relative whitespace-nowrap">Diabetes<svg className="absolute w-full h-3 -bottom-1 left-0 text-emerald-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none"/></svg></span> Today.
                        </h1>
                        <p className="text-lg text-slate-600 mb-8 font-medium leading-relaxed max-w-lg">
                            Get your diabetes medication delivered to your door in 60 minutes. Plus, get a free personalized Diet Consultation from our expert pharmacists.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-10">
                            <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                    <i className="fa-solid fa-motorcycle"></i>
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 text-sm">60-Min Delivery</div>
                                    <div className="text-xs text-slate-500">Anywhere in GKP</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                                    <i className="fa-solid fa-tags"></i>
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 text-sm">Flat 20% OFF</div>
                                    <div className="text-xs text-slate-500">On first order</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lead Gen Form */}
                    <div className="bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 p-8 lg:p-10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                        
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Claim Your 20% OFF Coupon</h2>
                        <p className="text-slate-500 text-sm mb-8 font-medium">Enter your WhatsApp number to instantly receive your discount code and free diet consultation.</p>

                        {status === "success" ? (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                                    <i className="fa-solid fa-check"></i>
                                </div>
                                <h3 className="text-xl font-bold text-emerald-900 mb-2">You're All Set!</h3>
                                <p className="text-emerald-700 text-sm">{message}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Your Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <i className="fa-solid fa-user"></i>
                                        </div>
                                        <input 
                                            type="text" 
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block pl-10 p-3.5 transition-all outline-none" 
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">WhatsApp Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-500">
                                            <i className="fa-brands fa-whatsapp text-lg"></i>
                                        </div>
                                        <input 
                                            type="tel" 
                                            required
                                            pattern="[0-9]{10}"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block pl-11 p-3.5 transition-all outline-none" 
                                            placeholder="10-digit mobile number"
                                        />
                                    </div>
                                </div>

                                {status === "error" && (
                                    <div className="text-rose-500 text-sm font-bold bg-rose-50 p-3 rounded-lg border border-rose-100">
                                        {message}
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={status === "loading"}
                                    className="w-full text-white bg-emerald-600 hover:bg-emerald-700 font-black rounded-xl text-sm px-5 py-4 text-center transition-all shadow-[0_8px_20px_-6px_rgba(5,150,105,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(5,150,105,0.5)] transform hover:-translate-y-0.5 uppercase tracking-wide flex justify-center items-center gap-2 disabled:opacity-70 disabled:transform-none"
                                >
                                    {status === "loading" ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                                    {status === "loading" ? "Processing..." : "Get Coupon on WhatsApp"}
                                </button>
                                <p className="text-[10px] text-center text-slate-400 font-medium mt-4">We respect your privacy. No spam, ever.</p>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

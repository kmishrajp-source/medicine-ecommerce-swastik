"use client";
import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CompleteGuide() {
    const { cartCount, toggleCart } = useCart();
    const [activeTab, setActiveTab] = useState('medicines');

    // ── Tab Navigation ───────────────────────────────────────────────────────
    const tabs = [
        { id: 'medicines', icon: '💊', label: 'Order Medicines' },
        { id: 'doctor', icon: '👨‍⚕️', label: 'Book Doctor' },
        { id: 'track', icon: '📍', label: 'Track Delivery' },
        { id: 'lab', icon: '🧪', label: 'Book Lab Test' },
        { id: 'hospital', icon: '🏥', label: 'Find Hospital' },
        { id: 'ambulance', icon: '🚑', label: 'Ambulance' },
        { id: 'refer', icon: '💰', label: 'Earn Referrals' }
    ];

    // ── Guide Content ────────────────────────────────────────────────────────
    const guides = {
        medicines: {
            title: "How to Order Medicines",
            desc: "A simple guide to finding medicines, saving up to 80% with generics, and lightning-fast delivery.",
            steps: [
                { icon: "🔍", title: "1. Search & Select", desc: "Use the top search bar to find medicines by brand or generic name.", action: "Shop Now", link: "/shop", color: "text-blue-500", bg: "bg-blue-50" },
                { icon: "📋", title: "2. Upload Prescription", desc: "For Rx medicines, safely upload a photo of your doctor's slip at checkout.", color: "text-emerald-500", bg: "bg-emerald-50" },
                { icon: "💳", title: "3. Checkout & Pay", desc: "Add your address and choose Online Payment, Wallet, or Cash on Delivery.", color: "text-amber-500", bg: "bg-amber-50" }
            ]
        },
        doctor: {
            title: "How to Consult a Doctor",
            desc: "Book top specialists for online video consults or in-person clinic visits easily.",
            steps: [
                { icon: "🩺", title: "1. Choose Specialist", desc: "Go to Doctor Consult and pick a specialty (Cardiology, Neurology, etc.).", action: "Book Doctor", link: "/doctors", color: "text-purple-500", bg: "bg-purple-50" },
                { icon: "🗓️", title: "2. Pick a Time Slot", desc: "Select an available date and time that works best for you.", color: "text-pink-500", bg: "bg-pink-50" },
                { icon: "📱", title: "3. Connect & Consult", desc: "Join the video call or visit the clinic. Get your digital prescription instantly after.", color: "text-blue-500", bg: "bg-blue-50" }
            ]
        },
        track: {
            title: "How to Track Delivery",
            desc: "Watch your order arrive in real-time with our live GPS tracking system.",
            steps: [
                { icon: "👤", title: "1. Go to Profile", desc: "Click on your Profile in the top menu and open the 'My Orders' section.", action: "My Orders", link: "/profile", color: "text-emerald-500", bg: "bg-emerald-50" },
                { icon: "📦", title: "2. Select Your Order", desc: "Find your active order and click the 'Track Order' button.", color: "text-amber-500", bg: "bg-amber-50" },
                { icon: "🗺️", title: "3. View Live Map", desc: "See exactly where the rider is on the map and check the timeline steps.", color: "text-rose-500", bg: "bg-rose-50" }
            ]
        },
        lab: {
            title: "How to Book a Lab Test",
            desc: "Get blood tests and body checkups done safely with home sample collection.",
            steps: [
                { icon: "🔬", title: "1. Find Your Test", desc: "Search for specific tests (CBC, Thyroid) or full body health packages.", action: "View Lab Tests", link: "/lab-tests", color: "text-cyan-500", bg: "bg-cyan-50" },
                { icon: "🏠", title: "2. Choose Location", desc: "Select 'Home Collection' or choose to visit a nearby partner lab.", color: "text-purple-500", bg: "bg-purple-50" },
                { icon: "📄", title: "3. Digital Reports", desc: "Once tested, your secure medical reports are instantly available on your profile.", color: "text-green-500", bg: "bg-green-50" }
            ]
        },
        hospital: {
            title: "How to Book a Hospital OPD",
            desc: "Connect directly with verified hospitals for OPD appointments or emergencies.",
            steps: [
                { icon: "🏥", title: "1. Search Hospitals", desc: "Browse hospitals by city, specialty, or the insurance they accept.", action: "Find Hospital", link: "/hospitals", color: "text-red-500", bg: "bg-red-50" },
                { icon: "📅", title: "2. Request Booking", desc: "Click 'Book Appointment' to request an OPD slot with a specific department.", color: "text-blue-500", bg: "bg-blue-50" },
                { icon: "✅", title: "3. Confirmation", desc: "The hospital desk will confirm your appointment via Swastik and WhatsApp.", color: "text-emerald-500", bg: "bg-emerald-50" }
            ]
        },
        ambulance: {
            title: "How to Book an Ambulance",
            desc: "Fast, reliable emergency transport when you need it most. Call 108 for extreme emergencies.",
            steps: [
                { icon: "🆘", title: "1. Select Service Type", desc: "Choose between Basic Life Support, ICU/Ventilator, or Mortuary van.", action: "Book Ambulance", link: "/ambulance", color: "text-rose-500", bg: "bg-rose-50" },
                { icon: "📍", title: "2. Share Location", desc: "Enter your pickup location and destination hospital.", color: "text-amber-500", bg: "bg-amber-50" },
                { icon: "🚀", title: "3. Instant Dispatch", desc: "Our nearest verified partner driver is dispatched instantly with live tracking.", color: "text-purple-500", bg: "bg-purple-50" }
            ]
        },
        refer: {
            title: "How to Earn Referral Money",
            desc: "Share the gift of health and earn ₹50 in your Swastik Wallet for every successful referral.",
            steps: [
                { icon: "🔗", title: "1. Get Your Code", desc: "Go to your Profile and copy your unique Swastik Referral Code.", action: "Go to Profile", link: "/profile", color: "text-green-500", bg: "bg-green-50" },
                { icon: "📤", title: "2. Share with Friends", desc: "Send it via WhatsApp. Your friend gets a ₹50 Welcome Bonus when they sign up!", color: "text-blue-500", bg: "bg-blue-50" },
                { icon: "💰", title: "3. Earn Cash", desc: "When your friend completes their first order, ₹50 is instantly credited to your wallet.", color: "text-amber-500", bg: "bg-amber-50" }
            ]
        }
    };

    const currentGuide = guides[activeTab];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-32 pb-24 px-6 text-center text-white">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-block bg-white/10 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-6 border border-white/20">
                        📚 Swastik Help Center
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-tight">
                        Complete <span className="text-blue-400">Customer Guide</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
                        Step-by-step instructions on how to use every feature of the Swastik Medicare ecosystem.
                    </p>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 py-12 -mt-10 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Sidebar Tabs */}
                    <div className="lg:w-1/3 xl:w-1/4">
                        <div className="bg-white rounded-3xl p-4 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible sticky top-24">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-left font-bold transition-all whitespace-nowrap lg:whitespace-normal shrink-0 ${
                                        activeTab === tab.id 
                                        ? 'bg-blue-600 text-white shadow-md transform scale-[1.02]' 
                                        : 'bg-transparent text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <span className="text-xl">{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Guide Content Area */}
                    <div className="lg:w-2/3 xl:w-3/4">
                        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
                            
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{currentGuide.title}</h2>
                            <p className="text-lg text-slate-500 font-medium mb-10 pb-6 border-b border-slate-100">{currentGuide.desc}</p>
                            
                            <div className="space-y-6">
                                {currentGuide.steps.map((step, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row gap-6 p-6 rounded-3xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${step.bg}`}>
                                            {step.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`text-xl font-bold mb-2 ${step.color}`}>{step.title}</h3>
                                            <p className="text-slate-600 font-medium leading-relaxed mb-4">{step.desc}</p>
                                            
                                            {step.action && (
                                                <Link href={step.link} className={`inline-flex items-center text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-opacity ${step.bg} ${step.color} hover:opacity-80`}>
                                                    {step.action} <i className="fa-solid fa-arrow-right ml-2"></i>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>

                        {/* Ask AI Banner inside content area */}
                        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                                    <i className="fa-solid fa-robot text-blue-600"></i> Still confused?
                                </h3>
                                <p className="text-slate-600 font-medium">Ask our Swastik Voice AI any question in English or Hindi!</p>
                            </div>
                            <button 
                                onClick={() => window.dispatchEvent(new CustomEvent('open-medical-ai'))}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shrink-0 shadow-lg shadow-blue-200"
                            >
                                Open Voice AI
                            </button>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

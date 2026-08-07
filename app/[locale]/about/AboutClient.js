"use client";
import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import Link from 'next/link';

export default function AboutClient() {
    const { cartCount, toggleCart } = useCart();

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            {/* Hero Section */}
            <div className="bg-slate-900 pt-32 pb-20 px-6 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="inline-block bg-blue-500/20 text-blue-300 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-6">
                        HealthTech Startup
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                        Building the Future of Digital Healthcare
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed max-w-3xl mx-auto mb-10">
                        Swastik Medicare is a healthcare technology startup developing AI-powered digital healthcare infrastructure that connects patients, doctors, pharmacies, diagnostics, laboratories, and emergency healthcare services into one integrated digital ecosystem.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/innovation" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/30">
                            Explore Innovation
                        </Link>
                        <Link href="/partner" className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-xl transition-all border border-white/20">
                            Become a Partner
                        </Link>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-20 relative z-20">
                {/* Mission & Vision */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
                    <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6">
                            <i className="fa-solid fa-bullseye"></i>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Our Mission</h2>
                        <p className="text-slate-600 text-lg leading-relaxed font-medium">
                            To make affordable, accessible, intelligent, and technology-driven healthcare available to every individual through AI, digital health solutions, pharmacy services, diagnostics, telemedicine, and emergency healthcare.
                        </p>
                    </div>
                    <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mb-6">
                            <i className="fa-regular fa-eye"></i>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Our Vision</h2>
                        <p className="text-slate-600 text-lg leading-relaxed font-medium">
                            To become one of India's leading integrated digital healthcare platforms by leveraging artificial intelligence, healthcare interoperability, digital pharmacy networks, and innovative healthcare technologies.
                        </p>
                    </div>
                </div>

                {/* What We Build */}
                <div className="mb-24">
                    <h2 className="text-4xl font-black text-slate-900 text-center mb-12">What We Build</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: "fa-robot", color: "blue", title: "AI Healthcare Platform" },
                            { icon: "fa-pills", color: "emerald", title: "Digital Pharmacy" },
                            { icon: "fa-user-doctor", color: "indigo", title: "Online Doctor Consultation" },
                            { icon: "fa-microscope", color: "purple", title: "Laboratory Network" },
                            { icon: "fa-truck-medical", color: "red", title: "Ambulance Services" },
                            { icon: "fa-file-medical", color: "cyan", title: "Prescription Intelligence" },
                            { icon: "fa-store", color: "orange", title: "Healthcare Marketplace" },
                            { icon: "fa-network-wired", color: "slate", title: "Digital Health Infrastructure" },
                            { icon: "fa-handshake", color: "pink", title: "Pharmacy Partner Network" },
                            { icon: "fa-chart-pie", color: "teal", title: "Health Analytics" }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow text-center">
                                <div className={`w-14 h-14 bg-${feature.color}-50 text-${feature.color}-600 mx-auto rounded-2xl flex items-center justify-center text-2xl mb-4`}>
                                    <i className={`fa-solid ${feature.icon}`}></i>
                                </div>
                                <h3 className="font-bold text-slate-900">{feature.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why Swastik Medicare */}
                <div>
                    <h2 className="text-4xl font-black text-slate-900 text-center mb-12">Why Swastik Medicare</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-3xl bg-slate-900 text-white text-center">
                            <i className="fa-solid fa-microchip text-4xl text-blue-400 mb-6"></i>
                            <h3 className="text-2xl font-black mb-3">AI First</h3>
                            <p className="text-slate-400 font-medium">Leveraging Artificial Intelligence to improve clinical decisions, patient safety, and healthcare delivery.</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-blue-600 text-white text-center">
                            <i className="fa-solid fa-heart-pulse text-4xl text-blue-200 mb-6"></i>
                            <h3 className="text-2xl font-black mb-3">Patient Centric</h3>
                            <p className="text-blue-100 font-medium">Every tool, platform, and service is built around providing the best possible healthcare outcome for the patient.</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-indigo-600 text-white text-center">
                            <i className="fa-solid fa-earth-asia text-4xl text-indigo-200 mb-6"></i>
                            <h3 className="text-2xl font-black mb-3">Nationwide Ready</h3>
                            <p className="text-indigo-100 font-medium">A scalable cloud-native architecture prepared to integrate with the Ayushman Bharat Digital Mission (ABDM).</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

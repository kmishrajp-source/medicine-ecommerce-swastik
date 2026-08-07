"use client";
import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

export default function InnovationClient() {
    const { cartCount, toggleCart } = useCart();

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 pt-32 pb-20 px-6 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="inline-block bg-purple-500/20 text-purple-300 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-6 border border-purple-400/30">
                        <i className="fa-solid fa-microchip mr-2"></i> Technology Stack
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                        Innovation & Technology
                    </h1>
                    <p className="text-lg md:text-xl text-purple-100 font-medium leading-relaxed max-w-3xl mx-auto mb-10">
                        Building next-generation AI-powered healthcare technology for patients, healthcare providers, pharmacies, laboratories, and communities.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-20 relative z-20">
                {/* AI Healthcare Engine */}
                <div className="mb-24">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-slate-900 mb-4">AI Healthcare Engine</h2>
                        <p className="text-slate-500 font-medium max-w-2xl mx-auto">Proprietary artificial intelligence models designed to enhance clinical safety, improve patient understanding, and automate healthcare workflows.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-blue-200 transition-all group">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                                <i className="fa-solid fa-stethoscope"></i>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">AI Symptom Analysis</h3>
                            <ul className="space-y-3 text-sm font-medium text-slate-600">
                                <li className="flex items-center gap-3"><i className="fa-solid fa-check text-blue-500"></i> Intelligent symptom assessment</li>
                                <li className="flex items-center gap-3"><i className="fa-solid fa-check text-blue-500"></i> Preliminary health guidance</li>
                                <li className="flex items-center gap-3"><i className="fa-solid fa-check text-blue-500"></i> Decision support routing</li>
                            </ul>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-indigo-200 transition-all group">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                                <i className="fa-solid fa-file-prescription"></i>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">AI Prescription Analysis</h3>
                            <ul className="space-y-3 text-sm font-medium text-slate-600">
                                <li className="flex items-center gap-3"><i className="fa-solid fa-check text-indigo-500"></i> Prescription understanding</li>
                                <li className="flex items-center gap-3"><i className="fa-solid fa-check text-indigo-500"></i> Dosage interpretation</li>
                                <li className="flex items-center gap-3"><i className="fa-solid fa-check text-indigo-500"></i> Duplicate medicine detection</li>
                            </ul>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-emerald-200 transition-all group">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                                <i className="fa-solid fa-shield-virus"></i>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">Medicine Interaction Checker</h3>
                            <ul className="space-y-3 text-sm font-medium text-slate-600">
                                <li className="flex items-center gap-3"><i className="fa-solid fa-check text-emerald-500"></i> Drug interaction analysis</li>
                                <li className="flex items-center gap-3"><i className="fa-solid fa-check text-emerald-500"></i> Safety alerts</li>
                                <li className="flex items-center gap-3"><i className="fa-solid fa-check text-emerald-500"></i> Contraindication detection</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Architecture Diagram */}
                <div className="mb-24 bg-slate-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20"></div>
                    
                    <h2 className="text-3xl font-black mb-12 relative z-10">Healthcare Technology Platform</h2>
                    
                    <div className="flex flex-col items-center relative z-10 max-w-2xl mx-auto">
                        <div className="bg-slate-800 border border-slate-700 px-8 py-4 rounded-2xl w-full max-w-sm mb-4"><i className="fa-solid fa-user text-blue-400 mr-2"></i> Patient Node</div>
                        <i className="fa-solid fa-arrow-down text-slate-600 mb-4 text-xl"></i>
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-5 rounded-2xl w-full font-black text-xl shadow-lg shadow-blue-900/50 mb-4">
                            <i className="fa-solid fa-brain mr-2"></i> AI Healthcare Core
                        </div>
                        <div className="flex w-full justify-center gap-4 mb-4">
                            <i className="fa-solid fa-arrow-down text-slate-600 text-xl rotate-45 transform translate-x-4"></i>
                            <i className="fa-solid fa-arrow-down text-slate-600 text-xl"></i>
                            <i className="fa-solid fa-arrow-down text-slate-600 text-xl -rotate-45 transform -translate-x-4"></i>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl text-sm"><i className="fa-solid fa-user-doctor text-indigo-400 mb-2 block text-xl"></i>Doctors</div>
                            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl text-sm"><i className="fa-solid fa-store text-emerald-400 mb-2 block text-xl"></i>Pharmacies</div>
                            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl text-sm"><i className="fa-solid fa-microscope text-purple-400 mb-2 block text-xl"></i>Laboratories</div>
                            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl text-sm"><i className="fa-solid fa-truck-medical text-red-400 mb-2 block text-xl"></i>Emergency</div>
                        </div>
                        <i className="fa-solid fa-arrow-down text-slate-600 my-4 text-xl"></i>
                        <div className="bg-slate-800 border border-slate-700 px-8 py-4 rounded-2xl w-full max-w-sm"><i className="fa-solid fa-shield-halved text-emerald-400 mr-2"></i> Interoperable Digital Health Records</div>
                    </div>
                </div>

                {/* Tech Stack */}
                <div className="mb-24">
                    <h2 className="text-3xl font-black text-slate-900 text-center mb-12">Enterprise Technology Stack</h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        {['Frontend (React/Next.js)', 'Backend (Node.js)', 'Database (PostgreSQL)', 'Cloud Infrastructure', 'AI Services', 'API Layer (REST/GraphQL)', 'Mobile Ready', 'Analytics', 'End-to-End Security'].map((tech, i) => (
                            <span key={i} className="px-6 py-3 bg-white border border-slate-200 rounded-full font-bold text-slate-700 shadow-sm text-sm">
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Future Research & Innovation */}
                <div className="bg-blue-50 border border-blue-100 rounded-3xl p-10">
                    <h2 className="text-3xl font-black text-blue-900 mb-8 text-center">Research & Future Initiatives</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: "fa-brain", title: "Clinical Decision Support" },
                            { icon: "fa-chart-line", title: "Predictive Healthcare" },
                            { icon: "fa-satellite-dish", title: "Remote Patient Monitoring" },
                            { icon: "fa-shield-heart", title: "Preventive Healthcare" }
                        ].map((item, i) => (
                            <div key={i} className="text-center p-4">
                                <div className="w-12 h-12 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl mb-4">
                                    <i className={`fa-solid ${item.icon}`}></i>
                                </div>
                                <h4 className="font-bold text-blue-900 text-sm">{item.title}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

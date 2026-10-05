"use client";
import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { Link } from "@/i18n/navigation";

export default function ResearchLandingPage() {
    const { cartCount, toggleCart } = useCart();
    
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            {/* Hero Section */}
            <div className="bg-indigo-900 pt-32 pb-20 px-6 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="inline-block bg-white/20 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-white/30 backdrop-blur-sm">
                        🧬 Swastik AI Research & Bioinformatics
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-tight">
                        AI Research & Bioinformatics Services
                    </h1>
                    <p className="text-lg md:text-xl text-indigo-100 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
                        AI-powered research, bioinformatics and healthcare data intelligence for universities, hospitals, laboratories, biotechnology companies and healthcare organisations.
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/research/submit" className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl font-bold tracking-wider transition-colors shadow-lg shadow-emerald-500/30">
                            Request a Research Consultation
                        </Link>
                        <Link href="#services" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-xl font-bold tracking-wider transition-colors backdrop-blur-md">
                            Explore Research Services
                        </Link>
                    </div>
                </div>
            </div>

            {/* Disclaimer Bar */}
            <div className="bg-rose-50 border-b border-rose-100 py-3 px-6 text-center">
                <p className="text-rose-800 text-sm font-medium">
                    <i className="fa-solid fa-circle-info mr-2"></i>
                    <strong>Research and analytical support platform.</strong> AI-generated information is for research and decision-support purposes and does not replace qualified medical, laboratory, regulatory or scientific professionals.
                </p>
            </div>

            {/* Services Section */}
            <main id="services" className="max-w-6xl mx-auto px-6 py-20 relative z-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-black text-slate-900 mb-4">Our Service Divisions</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto">Providing advanced computational and intelligence services to accelerate healthcare discoveries.</p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Card 1 */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-transform">
                        <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                            <i className="fa-solid fa-microscope"></i>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-3">AI Research Intelligence</h3>
                        <ul className="text-slate-600 space-y-2 text-sm font-medium">
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> Literature review</li>
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> Scientific paper analysis</li>
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> Research trend analysis</li>
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> Evidence mapping</li>
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> Citation intelligence</li>
                        </ul>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-transform">
                        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                            <i className="fa-solid fa-dna"></i>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-3">Bioinformatics</h3>
                        <ul className="text-slate-600 space-y-2 text-sm font-medium">
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> DNA/RNA sequence analysis</li>
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> Genomic data analysis</li>
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> Variant annotation</li>
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> Gene-expression analysis</li>
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> Biomarker research</li>
                        </ul>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-transform">
                        <div className="w-14 h-14 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                            <i className="fa-solid fa-chart-pie"></i>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-3">Clinical Research Analytics</h3>
                        <p className="text-xs text-rose-500 font-bold mb-4 bg-rose-50 p-2 rounded-lg">Requires ethics/institutional approval</p>
                        <ul className="text-slate-600 space-y-2 text-sm font-medium">
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> Clinical research databases</li>
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> Study dashboards</li>
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> Cohort analysis</li>
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> Data cleaning & visualisation</li>
                        </ul>
                    </div>
                    
                    {/* Card 4 */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-transform">
                        <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                            <i className="fa-solid fa-brain"></i>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-3">AI & Machine Learning</h3>
                        <ul className="text-slate-600 space-y-2 text-sm font-medium">
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> Predictive modelling</li>
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> Scientific NLP</li>
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> Image-analysis research</li>
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> Research automation</li>
                            <li><i className="fa-solid fa-check text-emerald-500 mr-2"></i> Data pipelines</li>
                        </ul>
                    </div>

                    {/* Card 5 - Cancer Research (Future Facing) */}
                    <div className="bg-gradient-to-br from-slate-900 to-indigo-900 p-8 rounded-3xl shadow-xl shadow-indigo-900/20 md:col-span-2 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <i className="fa-solid fa-ribbon text-9xl"></i>
                        </div>
                        <div className="relative z-10">
                            <div className="inline-block bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                Future Research Programme
                            </div>
                            <h3 className="text-2xl font-black mb-3">Cancer Research AI</h3>
                            <p className="text-indigo-200 text-sm mb-6 max-w-lg">
                                Swastik is developing research capabilities in AI-assisted cancer research. <strong>Clinical diagnosis and treatment decisions remain the responsibility of qualified healthcare professionals.</strong>
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <ul className="text-indigo-100 space-y-2 text-sm font-medium">
                                    <li><i className="fa-solid fa-flask text-indigo-400 mr-2"></i> Cancer genomics</li>
                                    <li><i className="fa-solid fa-flask text-indigo-400 mr-2"></i> Early detection research</li>
                                    <li><i className="fa-solid fa-flask text-indigo-400 mr-2"></i> Biomarker discovery</li>
                                </ul>
                                <ul className="text-indigo-100 space-y-2 text-sm font-medium">
                                    <li><i className="fa-solid fa-flask text-indigo-400 mr-2"></i> Treatment-response research</li>
                                    <li><i className="fa-solid fa-flask text-indigo-400 mr-2"></i> Drug-target discovery</li>
                                    <li><i className="fa-solid fa-flask text-indigo-400 mr-2"></i> Precision oncology</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* CTA */}
                <div className="mt-20 bg-indigo-50 rounded-3xl p-10 text-center border border-indigo-100">
                    <h2 className="text-2xl font-black text-slate-900 mb-4">Ready to start a research project?</h2>
                    <p className="text-slate-600 mb-8 max-w-2xl mx-auto">Whether you are a university laboratory, hospital, or biotech startup, our infrastructure can scale to meet your computational needs.</p>
                    <Link href="/research/submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-colors inline-block">
                        Submit a Research Project <i className="fa-solid fa-arrow-right ml-2"></i>
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}

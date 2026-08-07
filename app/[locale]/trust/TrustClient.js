"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import Link from 'next/link';

export default function TrustClient() {
    const { cartCount, toggleCart } = useCart();
    const [companyInfo, setCompanyInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch dynamically from API (from our CompanyProfile model)
        const fetchCompanyProfile = async () => {
            try {
                const res = await fetch('/api/admin/company');
                const data = await res.json();
                setCompanyInfo(data);
            } catch (err) {
                console.error("Failed to load company profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCompanyProfile();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            {/* Hero Section */}
            <div className="bg-emerald-900 pt-32 pb-20 px-6 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="inline-block bg-emerald-500/30 text-emerald-100 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-6 border border-emerald-400">
                        <i className="fa-solid fa-shield-check mr-2"></i> Quality Assured
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                        Trust & Compliance
                    </h1>
                    <p className="text-lg md:text-xl text-emerald-100 font-medium leading-relaxed max-w-3xl mx-auto">
                        Swastik Medicare is committed to maintaining high standards of healthcare compliance, patient safety, transparency, security, and ethical business practices.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-20 relative z-20">
                {/* Startup India Positioning */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-[2rem] p-10 mb-16 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-full md:w-2/3">
                        <div className="inline-block bg-orange-200 text-orange-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                            Healthcare Technology Startup
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-4">Recognized Innovation in Healthcare</h2>
                        <p className="text-slate-600 font-medium leading-relaxed">
                            Swastik Medicare is an AI-powered healthcare technology startup focused on developing innovative digital healthcare solutions that improve access to quality healthcare through technology, interoperability, artificial intelligence, and integrated healthcare services.
                        </p>
                    </div>
                    <div className="w-full md:w-1/3 flex justify-center">
                        {/* Placeholder for Startup India / DPIIT Badge */}
                        <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center border-4 border-orange-200 shadow-xl shadow-orange-500/10 text-orange-400">
                            <i className="fa-solid fa-rocket text-6xl"></i>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
                    {/* Legal & Company Info */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full">
                            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center"><i className="fa-solid fa-building text-slate-400 mr-3"></i> Corporate Information</h2>
                            {loading ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                </div>
                            ) : (
                                <ul className="space-y-4 text-sm font-medium text-slate-600">
                                    <li className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-400">Legal Entity</span> <span className="font-bold text-slate-900 text-right">{companyInfo?.legalEntity || 'Updating...'}</span></li>
                                    <li className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-400">CIN</span> <span className="font-bold text-slate-900 text-right">{companyInfo?.cin || 'Updating...'}</span></li>
                                    <li className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-400">Registration No.</span> <span className="font-bold text-slate-900 text-right">{companyInfo?.registrationNumber || 'Updating...'}</span></li>
                                    <li className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-400">Registered Office</span> <span className="font-bold text-slate-900 text-right w-1/2">{companyInfo?.registeredOffice || 'Updating...'}</span></li>
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Pharmacy & GST Compliance */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full">
                            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center"><i className="fa-solid fa-file-contract text-emerald-500 mr-3"></i> Regulatory Compliance</h2>
                            {loading ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                </div>
                            ) : (
                                <ul className="space-y-4 text-sm font-medium text-slate-600">
                                    <li className="flex items-center gap-3"><i className="fa-solid fa-check-circle text-emerald-500"></i> Drug License: <strong className="text-slate-900 ml-auto">{companyInfo?.drugLicense || 'Updating...'}</strong></li>
                                    <li className="flex items-center gap-3"><i className="fa-solid fa-check-circle text-emerald-500"></i> Pharmacy Registration: <strong className="text-slate-900 ml-auto">{companyInfo?.pharmacyRegistration || 'Updating...'}</strong></li>
                                    <li className="flex items-center gap-3"><i className="fa-solid fa-check-circle text-emerald-500"></i> GST Number: <strong className="text-slate-900 ml-auto">{companyInfo?.gstNumber || 'Updating...'}</strong></li>
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Partner Verification Workflow */}
                <div className="mb-24">
                    <h2 className="text-3xl font-black text-slate-900 text-center mb-12">Strict Partner Verification</h2>
                    <div className="flex flex-wrap justify-center gap-6">
                        {['Verified Pharmacies', 'Verified Doctors', 'Verified Laboratories', 'Ambulance Partners', 'Healthcare Providers'].map((item, i) => (
                            <div key={i} className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-3">
                                <i className="fa-solid fa-shield-check text-emerald-500 text-xl"></i>
                                <span className="font-bold text-slate-700">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cyber Security & Data Privacy */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
                    <div className="bg-slate-900 text-white p-10 rounded-3xl">
                        <i className="fa-solid fa-server text-4xl text-blue-400 mb-6"></i>
                        <h2 className="text-2xl font-black mb-4">Enterprise Cyber Security</h2>
                        <ul className="space-y-3 font-medium text-slate-300">
                            <li><i className="fa-solid fa-lock text-slate-500 mr-2"></i> 256-bit SSL Encryption</li>
                            <li><i className="fa-solid fa-user-shield text-slate-500 mr-2"></i> Role-Based Access Control</li>
                            <li><i className="fa-solid fa-file-shield text-slate-500 mr-2"></i> Encrypted Health Records</li>
                            <li><i className="fa-solid fa-list-check text-slate-500 mr-2"></i> Immutable Audit Logs</li>
                        </ul>
                    </div>
                    <div className="bg-blue-50 p-10 rounded-3xl border border-blue-100">
                        <i className="fa-solid fa-user-lock text-4xl text-blue-600 mb-6"></i>
                        <h2 className="text-2xl font-black text-slate-900 mb-4">Data Privacy Guarantee</h2>
                        <p className="text-slate-600 font-medium mb-6">Patient data belongs exclusively to the patient. We enforce strict consent management workflows preventing unauthorized access to any medical records.</p>
                        <div className="flex gap-4">
                            <Link href="/privacy" className="text-sm font-bold text-blue-600 hover:underline">Privacy Policy &rarr;</Link>
                            <Link href="/terms" className="text-sm font-bold text-blue-600 hover:underline">Terms & Conditions &rarr;</Link>
                        </div>
                    </div>
                </div>

                {/* Quality Commitments */}
                <div className="text-center mb-24">
                    <h2 className="text-3xl font-black text-slate-900 mb-8">Our Quality Commitments</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        {['Patient Safety', 'Data Security', 'Ethical Healthcare', 'Responsible AI', 'Healthcare Accessibility', 'Innovation', 'Transparency', 'Continuous Improvement'].map((item, i) => (
                            <span key={i} className="px-5 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-sm"><i className="fa-solid fa-check text-emerald-500 mr-2"></i> {item}</span>
                        ))}
                    </div>
                </div>

                {/* Medical Disclaimer */}
                <div className="bg-red-50 p-8 rounded-2xl border border-red-100 flex items-start gap-4">
                    <i className="fa-solid fa-triangle-exclamation text-3xl text-red-500 shrink-0 mt-1"></i>
                    <div>
                        <h4 className="font-black text-red-900 mb-2">Important Medical Disclaimer</h4>
                        <p className="text-red-800 text-sm font-medium leading-relaxed">
                            The AI Symptom Analyzer and preliminary health guidance provided by Swastik Medicare are for informational purposes only and <strong>do not replace professional medical advice, diagnosis, or treatment.</strong> Always seek the advice of a qualified healthcare provider with any questions regarding a medical condition. In case of a medical emergency, call an ambulance or visit the nearest hospital immediately.
                        </p>
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}

"use client";
import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import Link from 'next/link';

export default function DigitalHealthClient() {
    const { cartCount, toggleCart } = useCart();
    const [activeTab, setActiveTab] = useState('patient'); // patient, doctor, pharmacy

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 pt-32 pb-20 px-6 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="inline-block bg-blue-500/30 border border-blue-400 text-blue-100 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-6 backdrop-blur-sm">
                        <i className="fa-solid fa-shield-halved mr-2"></i> ABDM Ready Architecture
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                        Building India's Next Generation Digital Healthcare Platform
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100 font-medium leading-relaxed max-w-3xl mx-auto mb-10">
                        Swastik Medicare is building an interoperable healthcare platform aligned with the <strong>Ayushman Bharat Digital Mission (ABDM)</strong>, enabling secure digital health records, verified healthcare professionals, interoperable prescriptions, and patient-controlled data sharing.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 -mt-10 relative z-20 pb-24">
                {/* Interactive Dashboard Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    <button 
                        onClick={() => setActiveTab('patient')}
                        className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg ${activeTab === 'patient' ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                    >
                        <i className="fa-solid fa-user-injured mr-2"></i> For Patients
                    </button>
                    <button 
                        onClick={() => setActiveTab('doctor')}
                        className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg ${activeTab === 'doctor' ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                    >
                        <i className="fa-solid fa-user-doctor mr-2"></i> For Doctors
                    </button>
                    <button 
                        onClick={() => setActiveTab('pharmacy')}
                        className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg ${activeTab === 'pharmacy' ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                    >
                        <i className="fa-solid fa-store mr-2"></i> For Pharmacies
                    </button>
                </div>

                {/* Dashboard Content */}
                {activeTab === 'patient' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* ABHA ID Card */}
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                                    <i className="fa-regular fa-id-card"></i>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4">ABHA ID Integration</h3>
                                <p className="text-slate-500 font-medium mb-6">Create, link, and verify your Ayushman Bharat Health Account (ABHA) directly through Swastik Medicare.</p>
                                <ul className="space-y-3 mb-8 text-sm font-bold text-slate-700">
                                    <li className="flex items-center gap-3"><i className="fa-solid fa-check text-emerald-500"></i> Create New ABHA ID</li>
                                    <li className="flex items-center gap-3"><i className="fa-solid fa-check text-emerald-500"></i> Link Existing ABHA</li>
                                    <li className="flex items-center gap-3"><i className="fa-solid fa-check text-emerald-500"></i> Verify via Aadhaar/Mobile OTP</li>
                                </ul>
                                <div className="inline-block bg-orange-100 text-orange-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                    Coming Soon (ABDM Integration Ready)
                                </div>
                            </div>

                            {/* PHR Card */}
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                                    <i className="fa-solid fa-notes-medical"></i>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4">Personal Health Records (PHR)</h3>
                                <p className="text-slate-500 font-medium mb-6">Securely store and manage all your healthcare documents in one interoperable, encrypted vault.</p>
                                <ul className="space-y-3 mb-8 text-sm font-bold text-slate-700">
                                    <li className="flex items-center gap-3"><i className="fa-solid fa-file-waveform text-indigo-400"></i> Digital Lab Reports</li>
                                    <li className="flex items-center gap-3"><i className="fa-solid fa-prescription text-indigo-400"></i> E-Prescriptions</li>
                                    <li className="flex items-center gap-3"><i className="fa-solid fa-syringe text-indigo-400"></i> Vaccination Records</li>
                                </ul>
                                <button className="w-full bg-slate-100 text-slate-400 font-bold py-3 rounded-xl cursor-not-allowed">
                                    Access PHR Vault (Upcoming)
                                </button>
                            </div>

                            {/* Consent Management */}
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                                    <i className="fa-solid fa-user-lock"></i>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4">Consent Management</h3>
                                <p className="text-slate-500 font-medium mb-6">You have total control. Grant, review, or revoke doctor access to your health records instantly.</p>
                                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-black text-purple-900 uppercase tracking-widest mb-1">Status</p>
                                        <p className="text-sm font-bold text-purple-700">ABDM Consent Manager Ready</p>
                                    </div>
                                    <i className="fa-solid fa-shield-check text-2xl text-purple-300"></i>
                                </div>
                            </div>

                            {/* Prescription Vault */}
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                                    <i className="fa-solid fa-qrcode"></i>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4">Digital Prescription Vault</h3>
                                <p className="text-slate-500 font-medium mb-6">Interoperable prescriptions that can be securely shared with and verified by network pharmacies.</p>
                                <ul className="space-y-3 mb-8 text-sm font-bold text-slate-700">
                                    <li className="flex items-center gap-3"><i className="fa-solid fa-check text-emerald-500"></i> Share via QR Code</li>
                                    <li className="flex items-center gap-3"><i className="fa-solid fa-check text-emerald-500"></i> Pharmacy Verification Status</li>
                                    <li className="flex items-center gap-3"><i className="fa-solid fa-check text-emerald-500"></i> AI Prescription Analysis</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'doctor' && (
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row gap-12 items-center">
                            <div className="flex-1">
                                <div className="inline-block bg-indigo-100 text-indigo-700 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-6">
                                    Provider Identity
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 mb-6">Health Professional Registry (HPR)</h3>
                                <p className="text-slate-500 font-medium mb-8 text-lg leading-relaxed">
                                    Our platform architecture is prepared to integrate with the HPR. Doctors will be able to verify their identity, medical council registration, and qualifications to build instant trust with patients nationwide.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <i className="fa-solid fa-file-signature text-2xl text-indigo-400 mb-4"></i>
                                        <h4 className="font-black text-slate-900">Digital Signatures</h4>
                                        <p className="text-xs text-slate-500 mt-2 font-medium">Issue ABDM-compliant e-prescriptions</p>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <i className="fa-solid fa-handshake-angle text-2xl text-indigo-400 mb-4"></i>
                                        <h4 className="font-black text-slate-900">Consent Requests</h4>
                                        <p className="text-xs text-slate-500 mt-2 font-medium">Request PHR access securely</p>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-1/3 bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Doctor Dashboard Widget</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                                        <span className="font-bold text-slate-300">HPR Status</span>
                                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">ABDM Compatible</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                                        <span className="font-bold text-slate-300">Prescriptions Issued</span>
                                        <span className="font-black text-xl">1,204</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-slate-300">Pending Consents</span>
                                        <span className="font-black text-xl text-amber-400">3</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'pharmacy' && (
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row gap-12 items-center">
                            <div className="w-full md:w-1/3">
                                <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 text-center">
                                    <i className="fa-solid fa-qrcode text-6xl text-emerald-600 mb-6"></i>
                                    <h4 className="font-black text-emerald-900 text-xl mb-2">Scan Digital Rx</h4>
                                    <p className="text-sm text-emerald-700 font-medium">Designed for ABDM Prescription Workflow</p>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-3xl font-black text-slate-900 mb-6">Digital Prescription Verification</h3>
                                <p className="text-slate-500 font-medium mb-8 text-lg leading-relaxed">
                                    Pharmacies on the Swastik Medicare network will be equipped to scan, verify, and fulfill ABDM-compliant digital prescriptions. This ensures authenticity, prevents double-dispensing, and maintains a secure audit trail.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-black shrink-0">1</div>
                                        <div>
                                            <h5 className="font-black text-slate-900">Verify Cryptographic Signature</h5>
                                            <p className="text-sm text-slate-500">Ensure the prescription was issued by an HPR-verified doctor.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-black shrink-0">2</div>
                                        <div>
                                            <h5 className="font-black text-slate-900">Log Dispensing Event</h5>
                                            <p className="text-sm text-slate-500">Record medicines dispensed against the prescription in the patient's PHR.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Compliance & Commitment Section */}
                <div className="mt-24 pt-24 border-t border-slate-200">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <h2 className="text-3xl font-black text-slate-900 mb-6">Swastik Medicare Digital Health Commitment</h2>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">
                            Swastik Medicare is actively building an interoperable healthcare platform aligned with India's Ayushman Bharat Digital Mission (ABDM). Our objective is to enable secure, consent-based digital healthcare through interoperable health records, verified healthcare professionals, digital prescriptions, and future-ready healthcare infrastructure.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div className="p-6">
                            <i className="fa-solid fa-lock text-3xl text-slate-300 mb-4"></i>
                            <h4 className="font-bold text-slate-900">Patient Privacy</h4>
                        </div>
                        <div className="p-6">
                            <i className="fa-solid fa-server text-3xl text-slate-300 mb-4"></i>
                            <h4 className="font-bold text-slate-900">Secure Health Records</h4>
                        </div>
                        <div className="p-6">
                            <i className="fa-solid fa-handshake text-3xl text-slate-300 mb-4"></i>
                            <h4 className="font-bold text-slate-900">Consent-Based Sharing</h4>
                        </div>
                        <div className="p-6">
                            <i className="fa-solid fa-network-wired text-3xl text-slate-300 mb-4"></i>
                            <h4 className="font-bold text-slate-900">Interoperability</h4>
                        </div>
                    </div>
                </div>

                {/* Important Notice */}
                <div className="mt-16 bg-blue-50 border-2 border-blue-100 p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl shrink-0">
                        <i className="fa-solid fa-circle-info"></i>
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-blue-900 mb-2">Important Notice: ABDM Ready Architecture</h4>
                        <p className="text-blue-700 font-medium leading-relaxed">
                            Swastik Medicare has been architecturally designed to support future integration with the Ayushman Bharat Digital Mission (ABDM). Live integration with government services (including ABHA creation and live PHR syncing) will be fully enabled after obtaining the required approvals, registrations, and API credentials from the National Health Authority (NHA).
                        </p>
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}

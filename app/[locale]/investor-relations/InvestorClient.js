'use client';

import React from 'react';
import Link from 'next/link';

export default function InvestorClient() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-200">
      
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-24 px-6 md:px-12">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 to-slate-900/90 z-0"></div>
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-semibold mb-6 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Investor Relations
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Transforming <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Digital Healthcare</span> in India
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-xl">
              Swastik Medicare is building a comprehensive, ABDM-ready digital healthcare ecosystem that bridges the gap between urban specialists and rural patients.
            </p>
            <div className="flex gap-4">
              <a href="#pitch" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg shadow-emerald-500/30">View Pitch Deck</a>
              <a href="#contact" className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 px-6 py-3 rounded-lg font-bold transition-all">Contact Founders</a>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent blur-3xl rounded-full"></div>
            <img src="/assets/investor-hero.svg" alt="Digital Health Network" className="relative z-10 w-full opacity-80" onError={(e) => e.target.style.display = 'none'} />
          </div>
        </div>
      </section>

      {/* The Problem & Solution */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-2">The Problem</h2>
            <h3 className="text-3xl font-bold text-slate-900 mb-6">Fragmented Healthcare Access</h3>
            <ul className="space-y-4 text-slate-600">
              <li className="flex items-start"><i className="fa-solid fa-xmark text-rose-500 mt-1 mr-3"></i> <span><strong>Rural Disparity:</strong> 70% of India's population lives in rural areas, but 80% of doctors are urban.</span></li>
              <li className="flex items-start"><i className="fa-solid fa-xmark text-rose-500 mt-1 mr-3"></i> <span><strong>Medicine Availability:</strong> Tier 2/3 cities face critical shortages of specialized medicines.</span></li>
              <li className="flex items-start"><i className="fa-solid fa-xmark text-rose-500 mt-1 mr-3"></i> <span><strong>Siloed Data:</strong> Patient health records are scattered, leading to redundant tests and clinical errors.</span></li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-2">The Solution</h2>
            <h3 className="text-3xl font-bold text-slate-900 mb-6">Integrated Digital Ecosystem</h3>
            <ul className="space-y-4 text-slate-600">
              <li className="flex items-start"><i className="fa-solid fa-check text-emerald-500 mt-1 mr-3"></i> <span><strong>Unified Platform:</strong> Connecting patients, doctors, pharmacies, labs, and ambulances on a single app.</span></li>
              <li className="flex items-start"><i className="fa-solid fa-check text-emerald-500 mt-1 mr-3"></i> <span><strong>AI-Powered Triage:</strong> Intelligent symptom checkers and prescription OCR to streamline care.</span></li>
              <li className="flex items-start"><i className="fa-solid fa-check text-emerald-500 mt-1 mr-3"></i> <span><strong>ABDM Architecture:</strong> Consent-based, interoperable Personal Health Records (PHR) linked to ABHA.</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Verified Traction - Note: Driven by actual DB data, placeholders for now until API is built */}
      <section className="bg-white py-20 px-6 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Verified Platform Traction</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Our growth is driven by genuine utility and a rapidly expanding network of verified healthcare partners.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-4xl font-extrabold text-slate-900 mb-2">Data</div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Coming Soon</div>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-4xl font-extrabold text-slate-900 mb-2">Data</div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Coming Soon</div>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-4xl font-extrabold text-slate-900 mb-2">Data</div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Coming Soon</div>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-4xl font-extrabold text-slate-900 mb-2">Data</div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Coming Soon</div>
            </div>
          </div>
          <p className="text-xs text-center text-slate-400 mt-6">* Financial and detailed operational metrics are available in the data room for qualified institutional investors.</p>
        </div>
      </section>

      {/* Business Model */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Diversified Revenue Streams</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">A highly scalable business model capturing value across the entire healthcare continuum.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-6">
              <i className="fa-solid fa-pills text-xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">E-Pharmacy Margins</h3>
            <p className="text-slate-600 text-sm">Direct margins on B2C medicine delivery and B2B bulk orders to our partner retailer network.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-6">
              <i className="fa-solid fa-crown text-xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Swastik Prime SaaS</h3>
            <p className="text-slate-600 text-sm">High-margin recurring revenue from Patient Memberships, Corporate Wellness API subscriptions, and Hospital White-label EHRs.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center mb-6">
              <i className="fa-solid fa-handshake text-xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Partner Commissions</h3>
            <p className="text-slate-600 text-sm">Lead generation fees and commission take-rates on doctor consultations, lab bookings, and ambulance dispatches.</p>
          </div>
        </div>
      </section>
      
    </div>
  );
}

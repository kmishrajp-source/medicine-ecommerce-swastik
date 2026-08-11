'use client';

import React from 'react';
import Link from 'next/link';

export default function ImpactClient() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* Header */}
      <section className="bg-emerald-800 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Our Social Impact</h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            We measure our success not just by revenue, but by the lives we touch. Here is how Swastik Medicare is democratizing healthcare across India.
          </p>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        
        {/* Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-users text-xl"></i>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">Data</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Patients Served</div>
            <p className="text-xs text-slate-400 mt-2">Coming Soon</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-house-medical text-xl"></i>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">Data</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rural Outreach</div>
            <p className="text-xs text-slate-400 mt-2">Coming Soon</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-file-prescription text-xl"></i>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">Data</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Digital Prescriptions</div>
            <p className="text-xs text-slate-400 mt-2">Coming Soon</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-truck-medical text-xl"></i>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">Data</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Emergency Dispatches</div>
            <p className="text-xs text-slate-400 mt-2">Coming Soon</p>
          </div>
        </div>

        {/* Initiatives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100">
            <h3 className="text-2xl font-bold text-emerald-900 mb-4">Bridging the Rural Gap</h3>
            <p className="text-emerald-800 mb-6">
              Our "Rural Digital Health Mode" allows patients in low-bandwidth areas (2G/3G) to access top-tier specialists via lightweight interfaces and voice-assisted navigation in regional languages.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center text-emerald-700 font-medium">
                <i className="fa-solid fa-check-circle text-emerald-500 mr-2"></i> Hindi & Regional Support
              </li>
              <li className="flex items-center text-emerald-700 font-medium">
                <i className="fa-solid fa-check-circle text-emerald-500 mr-2"></i> Low-Bandwidth Optimization
              </li>
              <li className="flex items-center text-emerald-700 font-medium">
                <i className="fa-solid fa-check-circle text-emerald-500 mr-2"></i> WhatsApp Consultation Bot
              </li>
            </ul>
          </div>
          
          <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100">
            <h3 className="text-2xl font-bold text-indigo-900 mb-4">ABDM Ecosystem Integration</h3>
            <p className="text-indigo-800 mb-6">
              We are actively building infrastructure that aligns with the Ayushman Bharat Digital Mission, ensuring every citizen has secure, interoperable access to their health history.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center text-indigo-700 font-medium">
                <i className="fa-solid fa-check-circle text-indigo-500 mr-2"></i> ABHA Linkage Architecture
              </li>
              <li className="flex items-center text-indigo-700 font-medium">
                <i className="fa-solid fa-check-circle text-indigo-500 mr-2"></i> Consent-Based Data Sharing
              </li>
              <li className="flex items-center text-indigo-700 font-medium">
                <i className="fa-solid fa-check-circle text-indigo-500 mr-2"></i> Verified Healthcare Registries
              </li>
            </ul>
          </div>
        </div>

      </section>
      
      {/* Footer CTA */}
      <section className="bg-white py-16 px-6 border-t border-slate-200 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Partner With Us for Impact</h2>
        <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
          Are you an NGO, government body, or healthcare institution looking to amplify your outreach? Let's collaborate to build a healthier India.
        </p>
        <Link href="/government-partnership" className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors">
          Explore Government Partnerships
        </Link>
      </section>

    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const programs = [
  {
    id: 'abdm',
    icon: 'fa-heart-pulse',
    color: 'emerald',
    title: 'Ayushman Bharat Digital Mission (ABDM)',
    badge: 'Integration Ready',
    badgeColor: 'emerald',
    description: 'Swastik Medicare is architecturally aligned with ABDM. We have implemented ABHA linking, consent-based PHR sharing, and interoperable health records following FHIR standards.',
    points: ['ABHA Number & Address Linking', 'Patient Consent Manager', 'FHIR-Compatible Health Records', 'Verified Healthcare Provider Registry'],
  },
  {
    id: 'dhis',
    icon: 'fa-indian-rupee-sign',
    color: 'blue',
    title: 'Digital Health Incentive Scheme (DHIS)',
    badge: 'Preparing Application',
    badgeColor: 'amber',
    description: 'We are actively preparing our DHIS application to receive incentives for digitizing health records. Our platform tracks prescriptions, lab reports, and doctor consultations in a compliant digital format.',
    points: ['Digital Prescription Tracking', 'Paperless Lab Report Management', 'Telemedicine Transaction Logs', 'Audit-Ready Compliance Reports'],
  },
  {
    id: 'startup',
    icon: 'fa-rocket',
    color: 'indigo',
    title: 'Startup India / DPIIT Recognition',
    badge: 'Applied',
    badgeColor: 'indigo',
    description: 'Swastik Medicare has applied for DPIIT Startup India recognition to access tax benefits, government procurement preferences, and accelerator programs for healthcare innovation.',
    points: ['Tax Exemption Eligibility', 'Government Procurement Priority', 'Innovation Fund Access', 'BIRAC Grant Pipeline'],
  },
  {
    id: 'gem',
    icon: 'fa-store',
    color: 'amber',
    title: 'Government e-Marketplace (GeM)',
    badge: 'In Progress',
    badgeColor: 'amber',
    description: 'We are onboarding onto GeM to supply medicines, lab kits, and ambulance services to central and state government departments, hospitals, and PSUs.',
    points: ['Medicine Supply to Govt. Hospitals', 'Lab Test Kits for Health Depts.', 'Ambulance Services on GeM', 'MSME Quota Eligibility'],
  },
];

export default function GovPartnershipClient() {
  const [activeTab, setActiveTab] = useState('abdm');
  const active = programs.find(p => p.id === activeTab);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1" style={{ marginTop: '140px' }}>

        {/* Hero */}
        <section className="relative bg-slate-900 text-white py-20 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(16,185,129,0.15)_0%,transparent_60%)]" />
          <div className="max-w-5xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-bold mb-6">
              <i className="fa-solid fa-building-columns"></i> Government & Institutional Partnerships
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
              A Platform Built for <span className="text-emerald-400">National Health</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-3xl mx-auto mb-10">
              Swastik Medicare is India's most comprehensive digital health platform, designed in alignment with national missions — from ABDM to Startup India — to help the Government deliver better healthcare outcomes for every citizen.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#programs" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/25">
                Explore Programs
              </a>
              <a href="#contact" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-8 py-3 rounded-xl transition-all">
                Request a Briefing
              </a>
            </div>
          </div>
        </section>

        {/* Trust Strip */}
        <section className="bg-white border-y border-slate-200 py-6 px-6">
          <div className="max-w-5xl mx-auto flex flex-wrap justify-center items-center gap-8 text-sm font-bold text-slate-500">
            <span className="flex items-center gap-2"><i className="fa-solid fa-shield-check text-emerald-500"></i> ABDM-Architecture Ready</span>
            <span className="text-slate-200">|</span>
            <span className="flex items-center gap-2"><i className="fa-solid fa-rocket text-indigo-500"></i> DPIIT Startup India Applicant</span>
            <span className="text-slate-200">|</span>
            <span className="flex items-center gap-2"><i className="fa-solid fa-store text-amber-500"></i> GeM Onboarding In Progress</span>
            <span className="text-slate-200">|</span>
            <span className="flex items-center gap-2"><i className="fa-solid fa-lock text-blue-500"></i> Privacy-First Architecture</span>
          </div>
        </section>

        {/* Programs Section */}
        <section id="programs" className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-slate-900 mb-3">Government Program Alignment</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Our platform is built to actively support national digital health missions and accelerate the journey toward universal health coverage.</p>
          </div>

          {/* Tab Navigator */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {programs.map(p => (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                  activeTab === p.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <i className={`fa-solid ${p.icon} mr-2`}></i>{p.title.split('(')[0].trim()}
              </button>
            ))}
          </div>

          {/* Active Content Panel */}
          {active && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-12 transition-all">
              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className={`w-16 h-16 bg-${active.color}-100 text-${active.color}-600 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-inner`}>
                  <i className={`fa-solid ${active.icon}`}></i>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h3 className="text-2xl font-black text-slate-900">{active.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${active.badgeColor}-100 text-${active.badgeColor}-700 border border-${active.badgeColor}-200`}>
                      {active.badge}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-8 leading-relaxed">{active.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {active.points.map((point, i) => (
                      <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <i className={`fa-solid fa-check-circle text-${active.color}-500`}></i>
                        <span className="font-semibold text-slate-700 text-sm">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Impact Numbers */}
        <section className="bg-emerald-800 py-20 px-6 text-white">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-black mb-3">Healthcare Reach We're Building</h2>
            <p className="text-emerald-200 mb-14 max-w-2xl mx-auto">The platform is designed to scale for India — from metro hospitals to remote PHCs.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: 'fa-map-location-dot', label: 'States Targeted', value: '28+' },
                { icon: 'fa-house-medical', label: 'PHC Integration Capable', value: 'Ready' },
                { icon: 'fa-language', label: 'Regional Languages', value: 'Hindi First' },
                { icon: 'fa-wifi', label: 'Rural Bandwidth Mode', value: '2G/3G' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                    <i className={`fa-solid ${s.icon}`}></i>
                  </div>
                  <div className="text-3xl font-black mb-1">{s.value}</div>
                  <div className="text-emerald-200 text-sm font-semibold">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section id="contact" className="py-20 px-6 bg-white border-t border-slate-200">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Ready to Partner?</h2>
            <p className="text-slate-500 mb-8">Whether you're a state health department, government hospital, NGO, or central ministry — let's explore a partnership that delivers real health outcomes.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:partnerships@swastikmed.online" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-md shadow-emerald-500/20">
                <i className="fa-solid fa-envelope mr-2"></i> Email Our Partnerships Team
              </a>
              <Link href="/developer/api-portal" className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-8 py-4 rounded-xl transition-all border border-slate-200">
                <i className="fa-solid fa-code mr-2"></i> View Developer API
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

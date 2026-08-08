"use client";
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

const STATUS = {
  PLANNING:   { label: 'Planning',            color: 'text-slate-500',   bg: 'bg-slate-100',   dot: 'bg-slate-400',  border: 'border-slate-200' },
  APPLIED:    { label: 'Application Submitted', color: 'text-amber-700',  bg: 'bg-amber-50',    dot: 'bg-amber-400',  border: 'border-amber-200' },
  APPROVED:   { label: 'Approved',             color: 'text-emerald-700', bg: 'bg-emerald-50',  dot: 'bg-emerald-500', border: 'border-emerald-200' },
};

const recognitions = [
  {
    id: 'startup-india',
    name: 'Startup India',
    body: 'DPIIT, Ministry of Commerce',
    icon: 'fa-rocket',
    color: 'from-orange-500 to-rose-500',
    status: 'PLANNING',
    description: 'Recognition under Startup India program for innovative HealthTech solutions connecting patients, doctors, and pharmacies through AI-powered technology.',
    benefits: ['Tax exemption for 3 years', 'Fast-track patent filing', 'Government tender priority', 'Access to Startup India Hub'],
    link: 'https://www.startupindia.gov.in',
  },
  {
    id: 'dpiit',
    name: 'DPIIT Recognition',
    body: 'Dept. for Promotion of Industry & Internal Trade',
    icon: 'fa-building-columns',
    color: 'from-blue-600 to-indigo-600',
    status: 'PLANNING',
    description: 'Formal recognition from DPIIT as an eligible startup entity under the Startup India initiative, enabling access to various government schemes and incentives.',
    benefits: ['Self-certification compliance', 'Relaxed labour laws', 'Inter-ministerial startup fund access', 'IP support scheme'],
    link: 'https://dpiit.gov.in',
  },
  {
    id: 'abdm',
    name: 'ABDM Ready',
    body: 'Ayushman Bharat Digital Mission, NHA',
    icon: 'fa-shield-halved',
    color: 'from-indigo-600 to-purple-600',
    status: 'PLANNING',
    description: 'Architecture-ready integration with Ayushman Bharat Digital Mission for ABHA number support, Health Facility Registry, and consent-based digital health records.',
    benefits: ['ABHA number integration', 'PHR app certification', 'Health Facility Registry', 'Digital prescription ecosystem'],
    link: 'https://abdm.gov.in',
  },
  {
    id: 'digital-india',
    name: 'Digital India',
    body: 'Ministry of Electronics and IT',
    icon: 'fa-globe',
    color: 'from-emerald-600 to-teal-600',
    status: 'PLANNING',
    description: 'Alignment with the Digital India mission to expand digital healthcare services to rural and semi-urban populations, especially through low-bandwidth telemedicine.',
    benefits: ['GovTech marketplace listing', 'NIC cloud access', 'Digital India partnership', 'Rural connectivity support'],
    link: 'https://www.digitalindia.gov.in',
  },
  {
    id: 'msme',
    name: 'MSME / Udyam',
    body: 'Ministry of Micro, Small & Medium Enterprises',
    icon: 'fa-certificate',
    color: 'from-amber-500 to-orange-500',
    status: 'PLANNING',
    description: 'Registered as a Micro, Small & Medium Enterprise under the Udyam portal, enabling access to government procurement, subsidized loans, and MSME schemes.',
    benefits: ['Government tender eligibility', 'Priority sector lending', 'CGTMSE loan guarantee', 'Subsidy on technology upgradation'],
    link: 'https://udyamregistration.gov.in',
  },
  {
    id: 'birac',
    name: 'BIRAC Grant',
    body: 'Biotechnology Industry Research Assistance Council',
    icon: 'fa-flask',
    color: 'from-purple-600 to-violet-600',
    status: 'PLANNING',
    description: 'Application under BIRAC\'s BIG (Biotechnology Ignition Grant) and BIPP schemes for AI-powered healthcare innovation, focusing on prescription safety and rural health access.',
    benefits: ['Up to ₹50L BIG grant', 'BIPP milestone funding', 'Incubation support', 'Industry mentorship'],
    link: 'https://birac.nic.in',
  },
  {
    id: 'iso27001',
    name: 'ISO 27001',
    body: 'Information Security Management',
    icon: 'fa-lock',
    color: 'from-slate-600 to-slate-800',
    status: 'PLANNING',
    description: 'Implementation of ISO 27001 Information Security Management System to demonstrate enterprise-grade data security for patient health records and clinical data.',
    benefits: ['Patient data trust', 'Enterprise customer requirement', 'International expansion enabler', 'Insurance premium reduction'],
    link: 'https://www.iso.org/isoiec-27001-information-security.html',
  },
  {
    id: 'nabl',
    name: 'NABL Partner',
    body: 'National Accreditation Board for Testing & Calibration Labs',
    icon: 'fa-microscope',
    color: 'from-rose-600 to-pink-600',
    status: 'PLANNING',
    description: 'Partnership with NABL-accredited diagnostic laboratories on our platform to ensure all lab tests meet national quality standards and results are clinically reliable.',
    benefits: ['Quality assured lab results', 'Doctor confidence', 'Insurance acceptance', 'Hospital integration readiness'],
    link: 'https://nabl-india.org',
  },
  {
    id: 'nabh',
    name: 'NABH Partner',
    body: 'National Accreditation Board for Hospitals',
    icon: 'fa-hospital',
    color: 'from-sky-600 to-blue-600',
    status: 'PLANNING',
    description: 'Preferred platform for NABH-accredited hospitals and clinics, allowing their verified credentials to be displayed to patients booking consultations through Swastik Medicare.',
    benefits: ['Hospital trust badge', 'Quality patient routing', 'Corporate health plan integration', 'TPA acceptance'],
    link: 'https://nabh.co',
  },
];

export default function GovernmentClient() {
  const { cartCount, toggleCart } = useCart();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <>
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      <main style={{ marginTop: '160px' }}>

        {/* HERO */}
        <div className="relative bg-slate-900 py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(79,70,229,0.25)_0%,_transparent_70%)] pointer-events-none" />
          <div className="container mx-auto px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              <i className="fa-solid fa-certificate" /> Government & Compliance
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6">
              Government<br /><span className="text-emerald-400">Recognition</span>
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-3xl mx-auto mb-10">
              Swastik Medicare is being built to fully align with India's Digital Health ecosystem — supporting Startup India, DPIIT, ABDM, MSME, BIRAC and ISO standards.
            </p>
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
              <i className="fa-solid fa-circle-info text-blue-400 text-xl" />
              <p className="text-slate-300 text-sm font-medium text-left">
                Status cards below reflect our <span className="text-white font-bold">current compliance journey</span>. Cards will update to "Approved" as each recognition is obtained.
              </p>
            </div>
          </div>
        </div>

        {/* RECOGNITION CARDS */}
        <div className="container mx-auto px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recognitions.map((rec) => {
              const status = STATUS[rec.status];
              const isExpanded = expandedId === rec.id;
              return (
                <div
                  key={rec.id}
                  className={`bg-white rounded-3xl border-2 ${status.border} shadow-sm hover:shadow-xl transition-all overflow-hidden cursor-pointer group`}
                  onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                >
                  {/* Card Header */}
                  <div className={`bg-gradient-to-br ${rec.color} p-8 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
                    <div className="flex items-start justify-between relative z-10">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <i className={`fa-solid ${rec.icon} text-2xl`} />
                      </div>
                      <div className={`flex items-center gap-2 ${status.bg} ${status.color} px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider`}>
                        <span className={`w-2 h-2 rounded-full ${status.dot} ${rec.status === 'APPROVED' ? 'animate-pulse' : ''}`} />
                        {status.label}
                      </div>
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight mt-6 mb-1">{rec.name}</h3>
                    <p className="text-white/70 text-xs font-bold">{rec.body}</p>
                  </div>

                  {/* Card Body */}
                  <div className="p-8">
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">{rec.description}</p>

                    {/* Benefits */}
                    {isExpanded && (
                      <div className="mb-6 animate-in fade-in">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3">Key Benefits</h4>
                        <ul className="space-y-2">
                          {rec.benefits.map((b, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                              <i className="fa-solid fa-circle-check text-emerald-500 text-xs" /> {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <a
                        href={rec.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-indigo-600 hover:text-indigo-800 font-black text-xs uppercase tracking-widest flex items-center gap-1"
                      >
                        Official Site <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
                      </a>
                      <button className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                        {isExpanded ? 'Less' : 'Details'} <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} text-[10px]`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* GOVERNMENT READINESS TIMELINE */}
        <div className="bg-slate-50 py-20">
          <div className="container mx-auto px-8">
            <div className="text-center mb-16">
              <span className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-3 block">Roadmap</span>
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Compliance Roadmap 2026–2027</h2>
            </div>
            <div className="max-w-3xl mx-auto">
              {[
                { phase: 'Phase 1 — Now', items: ['Company Registration', 'GST Registration', 'Drug License', 'MSME / Udyam Registration'], color: 'border-emerald-500', dot: 'bg-emerald-500' },
                { phase: 'Phase 2 — Q3 2026', items: ['DPIIT Startup India Application', 'BIRAC BIG Grant Submission', 'ISO 27001 Audit Initiation', 'ABDM Sandbox Testing'], color: 'border-blue-500', dot: 'bg-blue-500' },
                { phase: 'Phase 3 — Q4 2026', items: ['DPIIT Recognition Certificate', 'MSME Udyam Certificate', 'NABL Lab Partner Agreement', 'Digital India Marketplace Listing'], color: 'border-indigo-500', dot: 'bg-indigo-500' },
                { phase: 'Phase 4 — 2027', items: ['ABDM Full Integration', 'ISO 27001 Certification', 'NABH Hospital Partner Network', 'BIRAC Grant Milestone 1'], color: 'border-purple-500', dot: 'bg-purple-500' },
              ].map((phase, i) => (
                <div key={i} className={`flex gap-6 mb-10 pl-6 border-l-4 ${phase.color}`}>
                  <div>
                    <div className={`inline-flex items-center gap-2 ${phase.dot} text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3`}>
                      {phase.phase}
                    </div>
                    <ul className="space-y-2">
                      {phase.items.map((item, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                          <i className="fa-solid fa-arrow-right text-slate-400 text-xs" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-900 py-20 text-white text-center">
          <div className="container mx-auto px-8">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Government & Enterprise Partnerships</h2>
            <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto mb-10">Swastik Medicare is actively seeking partnerships with government health departments, PSUs, and enterprise employers for corporate healthcare programs.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/partner" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all">
                <i className="fa-solid fa-handshake mr-2" /> Partner With Us
              </Link>
              <Link href="/trust" className="bg-white/10 border border-white/30 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all">
                <i className="fa-solid fa-shield-check mr-2" /> Trust & Compliance
              </Link>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}

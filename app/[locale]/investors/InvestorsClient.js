"use client";
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

const revenueStreams = [
  { name: 'Medicine Delivery', icon: 'fa-pills', color: 'bg-blue-500', pct: 45, desc: 'Commission on every medicine order fulfilled through the platform.' },
  { name: 'Doctor Consultations', icon: 'fa-user-doctor', color: 'bg-emerald-500', pct: 20, desc: 'Platform fee on telemedicine and in-clinic booking transactions.' },
  { name: 'Lab Tests', icon: 'fa-microscope', color: 'bg-purple-500', pct: 15, desc: 'Commission on diagnostic lab bookings and home collection.' },
  { name: 'Partner & SaaS', icon: 'fa-handshake', color: 'bg-amber-500', pct: 12, desc: 'Monthly SaaS fees from hospital, pharmacy, and corporate health partners.' },
  { name: 'AI Premium Services', icon: 'fa-robot', color: 'bg-rose-500', pct: 5, desc: 'Subscription revenue from premium AI health analysis features.' },
  { name: 'Insurance & Corporate', icon: 'fa-file-medical', color: 'bg-indigo-500', pct: 3, desc: 'Commission from insurance policy referrals and corporate health programs.' },
];

const highlights = [
  { label: 'Target Market (India HealthTech)', value: '$50B+', icon: 'fa-globe-asia', color: 'text-blue-500' },
  { label: 'Gorakhpur Addressable Market', value: '₹200Cr+', icon: 'fa-map-location-dot', color: 'text-emerald-500' },
  { label: 'Ecosystem Categories', value: '8+', icon: 'fa-sitemap', color: 'text-indigo-500' },
  { label: 'Year Founded', value: '2026', icon: 'fa-calendar', color: 'text-amber-500' },
];

export default function InvestorsClient() {
  const { cartCount, toggleCart } = useCart();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'model', label: 'Business Model' },
    { id: 'market', label: 'Market' },
    { id: 'technology', label: 'Technology' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <>
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      <main style={{ marginTop: '160px' }}>

        {/* HERO */}
        <div className="relative bg-slate-900 py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.15)_0%,_transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(79,70,229,0.15)_0%,_transparent_60%)] pointer-events-none" />
          <div className="container mx-auto px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              <i className="fa-solid fa-chart-line" /> Investor Relations
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6">
              Invest in<br /><span className="text-emerald-400">India's Health</span><br />Future
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-3xl mx-auto mb-10">
              Swastik Medicare is building AI-powered healthcare infrastructure for 1.4 billion Indians — starting with Gorakhpur and scaling across Uttar Pradesh, Bihar, and beyond.
            </p>
            <a href="mailto:invest@swastikmed.online" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-600/30">
              <i className="fa-solid fa-envelope" /> Contact Investment Team
            </a>
          </div>
        </div>

        {/* HIGHLIGHTS */}
        <div className="container mx-auto px-8 -mt-10 relative z-10 mb-20">
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {highlights.map((h, i) => (
              <div key={i} className="text-center">
                <i className={`fa-solid ${h.icon} text-3xl ${h.color} mb-3 block`} />
                <div className="text-2xl font-black text-slate-900 mb-1 tracking-tighter">{h.value}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{h.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TABS */}
        <div className="container mx-auto px-8 mb-8">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="container mx-auto px-8 pb-24 min-h-[400px]">

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-6">Company Overview</h2>
                <p className="text-slate-600 leading-relaxed mb-6">Swastik Medicare is an AI-powered Digital Healthcare Platform connecting patients with doctors, pharmacies, diagnostic laboratories, and ambulance services through a single integrated technology ecosystem.</p>
                <p className="text-slate-600 leading-relaxed mb-6">Launched in 2026, we are pioneering the convergence of AI intelligence, prescription safety, telemedicine, and digital health records for Tier-2 and semi-urban India — a segment chronically underserved by existing digital health players.</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Vision', value: 'Make quality healthcare accessible to every Indian through technology.' },
                    { label: 'Mission', value: 'Build India\'s most trusted AI-powered healthcare network, starting at the grassroots.' },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{item.label}</div>
                      <p className="text-sm text-slate-700 font-medium leading-snug">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900 rounded-3xl p-10 text-white border border-slate-800">
                <h3 className="text-xl font-black uppercase tracking-tight mb-8 text-emerald-400">Competitive Advantage</h3>
                <ul className="space-y-5">
                  {[
                    { title: 'AI-First Platform', desc: 'Proprietary AI engine for prescription safety, symptom analysis, and drug interaction checking.' },
                    { title: 'Full Ecosystem Coverage', desc: '8+ healthcare verticals in one platform — no competitor covers all.' },
                    { title: 'Tier-2 City Focus', desc: 'Deliberate focus on Gorakhpur and similar markets ignored by urban-centric competitors.' },
                    { title: 'ABDM Ready', desc: 'Architecture aligned with India\'s national health digital mission for future government contracts.' },
                    { title: 'Hyperlocal Execution', desc: '150+ local pharmacy partners enabling same-day and emergency medicine delivery.' },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4">
                      <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="fa-solid fa-check text-emerald-400 text-xs" />
                      </div>
                      <div>
                        <div className="font-black text-white text-sm mb-1">{item.title}</div>
                        <div className="text-slate-400 text-xs leading-relaxed">{item.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'model' && (
            <div>
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-10">Revenue Model</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {revenueStreams.map((stream, i) => (
                  <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all p-8">
                    <div className={`w-12 h-12 ${stream.color} rounded-2xl flex items-center justify-center mb-5`}>
                      <i className={`fa-solid ${stream.icon} text-white text-xl`} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-2">{stream.name}</h3>
                    <p className="text-slate-500 text-sm mb-5">{stream.desc}</p>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`${stream.color} h-2 rounded-full`} style={{ width: `${stream.pct}%` }} />
                    </div>
                    <div className="text-right text-xs font-black text-slate-400 mt-1">{stream.pct}% revenue mix</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'market' && (
            <div className="max-w-4xl">
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-8">Healthcare Market Opportunity</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                  { label: 'India HealthTech Market (2027)', value: '$50B+', sub: 'CAGR 20%+', color: 'border-blue-500' },
                  { label: 'Digital Pharmacy Market', value: '$3.7B', sub: 'by 2027', color: 'border-emerald-500' },
                  { label: 'UP+Bihar Addressable Market', value: '₹2,000Cr+', sub: 'underserved segment', color: 'border-indigo-500' },
                ].map((m, i) => (
                  <div key={i} className={`border-l-4 ${m.color} pl-6`}>
                    <div className="text-3xl font-black text-slate-900 mb-1">{m.value}</div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</div>
                    <div className="text-xs text-slate-500">{m.sub}</div>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6">Why Gorakhpur First?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    'Population of 8M+ with severely limited access to quality digital healthcare.',
                    'Regional healthcare hub for UP, Bihar, and Uttarakhand border regions.',
                    '150+ pharmacy stores operating as physical nodes with no digital layer.',
                    'Growing middle-class spending on healthcare post-COVID.',
                    'Government\'s focus on Tier-2 healthcare infrastructure under PM Jan Arogya.',
                    'First-mover advantage in a market no national player has addressed.',
                  ].map((point, i) => (
                    <div key={i} className="flex gap-3 text-sm text-slate-600">
                      <i className="fa-solid fa-arrow-right text-indigo-500 mt-1 flex-shrink-0" /> {point}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'technology' && (
            <div>
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-8">Technology Platform</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: 'AI Healthcare Engine', icon: 'fa-microchip', desc: 'Proprietary NLP + clinical ML models for prescription safety, symptom analysis, drug interaction checking, and medication adherence.', tags: ['NLP', 'Clinical ML', 'Drug Database'] },
                  { title: 'ABDM-Ready Architecture', icon: 'fa-shield-halved', desc: 'Full infrastructure ready for ABHA number integration, PHR app certification, and digital consent management.', tags: ['ABHA', 'PHR', 'Consent API'] },
                  { title: 'Hyperlocal Fulfilment Network', icon: 'fa-shop', desc: 'A real-time inventory and order routing engine connecting 150+ local pharmacy partners for same-day and emergency delivery.', tags: ['Real-time Inventory', 'Last-mile Delivery', 'SOS'] },
                  { title: 'Multi-Stakeholder Platform', icon: 'fa-sitemap', desc: 'Separate dedicated portals for Patients, Doctors, Pharmacies, Labs, Riders, Manufacturers, and Admins — all on one integrated backend.', tags: ['Multi-tenant', 'Role-based', 'REST API'] },
                ].map((tech, i) => (
                  <div key={i} className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all">
                    <i className={`fa-solid ${tech.icon} text-3xl text-indigo-500 mb-5 block`} />
                    <h3 className="text-xl font-black text-slate-900 mb-3">{tech.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-5">{tech.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {tech.tags.map((tag, j) => (
                        <span key={j} className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div className="max-w-3xl">
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-10">Strategic Roadmap</h2>
              {[
                { year: '2026', color: 'border-emerald-500 bg-emerald-500', items: ['Launch in Gorakhpur', 'Doctor + Pharmacy + Lab + Ambulance', 'AI Prescription Analyzer', 'ABDM Architecture', 'Startup India / MSME Application'] },
                { year: '2027 Q1', color: 'border-blue-500 bg-blue-500', items: ['Expand to Varanasi, Lucknow', 'ABDM Full Integration', 'BIRAC Grant Deployment', 'ISO 27001 Certification', 'Corporate Health Programs'] },
                { year: '2027 Q3', color: 'border-indigo-500 bg-indigo-500', items: ['Series A Fundraise', '50 Smart Pharmacy Nodes', 'Wearable Health Integration', 'Population Health Analytics', 'Government Health Contracts'] },
                { year: '2028+', color: 'border-purple-500 bg-purple-500', items: ['National Expansion (10 cities)', 'International HealthTech Markets', 'AI Diagnosis Engine', 'Smart Hospital Integration', 'IPO Readiness'] },
              ].map((phase, i) => (
                <div key={i} className={`flex gap-6 mb-10 pl-8 border-l-4 ${phase.color.split(' ')[0]} relative`}>
                  <div className={`absolute -left-4 top-0 w-8 h-8 rounded-full ${phase.color.split(' ')[1]} flex items-center justify-center`}>
                    <i className="fa-solid fa-check text-white text-xs" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-black text-slate-900 uppercase tracking-widest mb-3">{phase.year}</div>
                    <ul className="space-y-2">
                      {phase.items.map((item, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                          <i className="fa-solid fa-arrow-right text-slate-300 text-xs" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="max-w-2xl">
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-6">Investment Contact</h2>
              <p className="text-slate-500 mb-10 leading-relaxed">We welcome conversations with seed investors, angel investors, strategic partners, and government innovation funds aligned with the Digital India and HealthTech mission.</p>
              <div className="bg-slate-900 rounded-3xl p-10 text-white">
                <div className="space-y-6">
                  {[
                    { icon: 'fa-envelope', label: 'Investment Enquiries', value: 'invest@swastikmed.online' },
                    { icon: 'fa-phone', label: 'Phone', value: '+91 79921 22974' },
                    { icon: 'fa-globe', label: 'Website', value: 'www.swastikmed.online' },
                    { icon: 'fa-location-dot', label: 'Registered Office', value: 'Gorakhpur, Uttar Pradesh, India' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 border-b border-white/10 pb-6 last:border-0 last:pb-0">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <i className={`fa-solid ${item.icon} text-emerald-400`} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</div>
                        <div className="text-white font-bold">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <a href="mailto:invest@swastikmed.online" className="mt-8 block w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all">
                  <i className="fa-solid fa-paper-plane mr-2" /> Send Investment Enquiry
                </a>
              </div>
            </div>
          )}

        </div>

      </main>
      <Footer />
    </>
  );
}

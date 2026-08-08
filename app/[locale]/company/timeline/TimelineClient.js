"use client";
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

const timeline = [
  {
    phase: 'Phase 1: Foundation',
    date: 'Q1-Q2 2026',
    status: 'completed',
    color: 'bg-emerald-500',
    border: 'border-emerald-500',
    title: 'Platform Launch in Gorakhpur',
    items: [
      'Launch of Swastik Medicare web platform',
      'Integration of Medicine Delivery, Doctor Consultation, and Lab Bookings',
      'Onboarding of initial 50+ local pharmacy partners',
      'Basic telemedicine infrastructure deployed',
    ],
  },
  {
    phase: 'Phase 2: Innovation & Compliance',
    date: 'Q3-Q4 2026',
    status: 'in-progress',
    color: 'bg-indigo-500',
    border: 'border-indigo-500',
    title: 'AI Integration & Government Readiness',
    items: [
      'Launch of AI Prescription Safety & Symptom Checker',
      'ABDM (Ayushman Bharat Digital Mission) architectural readiness',
      'Application for DPIIT Startup India & MSME recognition',
      'Scale pharmacy network to 150+ partners',
    ],
  },
  {
    phase: 'Phase 3: Expansion & Ecosystem',
    date: '2027',
    status: 'upcoming',
    color: 'bg-blue-500',
    border: 'border-blue-500',
    title: 'Regional Scale & B2B Partnerships',
    items: [
      'Expansion into Varanasi, Lucknow, and Patna',
      'Launch of Corporate Health Programs & Insurance integration',
      'ISO 27001 Certification for Data Security',
      'Full ABDM integration with live ABHA number support',
    ],
  },
  {
    phase: 'Phase 4: Advanced Tech & National',
    date: '2028+',
    status: 'upcoming',
    color: 'bg-purple-500',
    border: 'border-purple-500',
    title: 'Predictive Health & National Presence',
    items: [
      'Deployment of predictive health risk models (Cardiology & Diabetes)',
      'Wearable device integration for real-time patient monitoring',
      'Expansion across 10+ states in India',
      'Launch of Smart Hospital network integrations',
    ],
  },
];

export default function TimelineClient() {
  const { cartCount, toggleCart } = useCart();

  return (
    <>
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      <main style={{ marginTop: '160px' }}>

        {/* HERO */}
        <div className="relative bg-slate-900 py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.2)_0%,_transparent_60%)] pointer-events-none" />
          <div className="container mx-auto px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              <i className="fa-solid fa-timeline" /> Innovation Roadmap
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6">
              Building The<br /><span className="text-indigo-400">Future of Health</span>
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-3xl mx-auto">
              Our strategic roadmap to evolve from an online pharmacy into India's most comprehensive AI-powered digital healthcare ecosystem.
            </p>
          </div>
        </div>

        {/* TIMELINE */}
        <div className="container mx-auto px-8 py-24 max-w-4xl">
          <div className="relative border-l-4 border-slate-200 ml-6 md:ml-12">
            {timeline.map((phase, i) => (
              <div key={i} className="mb-16 last:mb-0 relative pl-8 md:pl-16">
                
                {/* Timeline Dot */}
                <div className={`absolute -left-[14px] top-0 w-6 h-6 rounded-full border-4 border-white ${phase.color} shadow-md flex items-center justify-center`}>
                  {phase.status === 'completed' && <i className="fa-solid fa-check text-white text-[10px]" />}
                  {phase.status === 'in-progress' && <i className="fa-solid fa-spinner fa-spin text-white text-[10px]" />}
                </div>

                {/* Phase Content */}
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-2 h-full ${phase.color}`} />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                    <div className={`text-[10px] font-black uppercase tracking-widest ${phase.color.replace('bg-', 'text-')}`}>
                      {phase.phase}
                    </div>
                    <div className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full w-fit">
                      {phase.date}
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 mb-6">{phase.title}</h3>

                  <ul className="space-y-4">
                    {phase.items.map((item, j) => (
                      <li key={j} className="flex gap-3 text-sm text-slate-600">
                        <i className={`fa-solid fa-arrow-right mt-1 flex-shrink-0 ${phase.status === 'completed' ? 'text-emerald-500' : 'text-slate-300'}`} /> 
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-50 py-20 text-center border-t border-slate-100">
          <div className="container mx-auto px-8">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Join Our Journey</h2>
            <p className="text-slate-500 max-w-xl mx-auto mb-10">Whether you are an investor, a healthcare provider, or a technology partner, we are always looking for visionary collaborators.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/investors" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all">
                <i className="fa-solid fa-chart-line mr-2" /> Investor Relations
              </Link>
              <Link href="/partner" className="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all shadow-sm">
                <i className="fa-solid fa-handshake mr-2" /> Partner With Us
              </Link>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}

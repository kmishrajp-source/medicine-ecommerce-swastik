'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const services = [
  { icon: 'fa-truck-medical', color: 'rose', title: '24/7 Ambulance Dispatch', desc: 'Book a verified ambulance in seconds. Our network covers basic life support (BLS), advanced life support (ALS), and neonatal transport.', cta: 'Book Ambulance', href: '/ambulance' },
  { icon: 'fa-bell', color: 'amber', title: 'SOS Emergency Alert', desc: 'One-tap emergency SOS from the app or WhatsApp. Notifies our dispatch team, your emergency contacts, and the nearest hospital simultaneously.', cta: 'Learn More', href: '/ambulance' },
  { icon: 'fa-hospital', color: 'blue', title: 'Hospital Coordination', desc: 'Our dispatchers call ahead to the destination hospital to prepare the trauma bay, so the team is ready the moment you arrive.', cta: 'Find Hospitals', href: '/hospitals' },
  { icon: 'fa-heart-pulse', color: 'violet', title: 'Real-Time Tracking', desc: 'Track the ambulance live on a map. Family members receive automatic SMS updates with ETA and ambulance location.', cta: 'Track Now', href: '/ambulance' },
];

const steps = [
  { num: '01', icon: 'fa-mobile-screen', title: 'Tap SOS', desc: 'Open the app and press the SOS button, or send "SOS" to our WhatsApp number.' },
  { num: '02', icon: 'fa-headset', title: 'Dispatch Activated', desc: 'Our 24/7 team confirms your location and dispatches the nearest available ambulance.' },
  { num: '03', icon: 'fa-truck-fast', title: 'Ambulance En Route', desc: 'Track the ambulance in real-time. Average response time: 8–12 minutes in covered areas.' },
  { num: '04', icon: 'fa-hospital', title: 'Hospital Ready', desc: 'The destination hospital is pre-alerted. Your electronic health record is shared with the ER team.' },
];

export default function EmergencyClient() {
  const [sosActive, setSosActive] = useState(false);

  return (
    <div className="bg-slate-950 min-h-screen flex flex-col text-white">
      <Navbar />
      <main className="flex-1" style={{ marginTop: '140px' }}>

        {/* Hero - Dark, urgent, impactful */}
        <section className="relative py-20 px-6 overflow-hidden bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(239,68,68,0.15)_0%,transparent_60%)]" />
          <div className="max-w-5xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-rose-500/30 text-rose-300 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
              <span className="w-2 h-2 bg-rose-400 rounded-full animate-ping"></span>
              Emergency Response — 24/7 Active
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
              Emergency Care,<br /><span className="text-rose-400">Seconds Away</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
              One tap connects you to a verified ambulance, pre-alerts the hospital, and shares your health records with the emergency team — automatically.
            </p>

            {/* Interactive SOS Button */}
            <div className="flex flex-col items-center gap-4 mb-10">
              <button
                onClick={() => setSosActive(!sosActive)}
                className={`relative w-36 h-36 rounded-full font-black text-xl tracking-widest transition-all shadow-2xl ${
                  sosActive
                    ? 'bg-rose-500 shadow-rose-500/50 scale-110 animate-pulse'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30 hover:scale-105'
                }`}
              >
                <span className="absolute inset-0 rounded-full border-4 border-rose-400 animate-ping opacity-30"></span>
                SOS
              </button>
              <p className="text-slate-400 text-sm">
                {sosActive ? '🚨 Demo active — dispatching in your area...' : 'Tap to see demo SOS activation'}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/ambulance" className="bg-rose-600 hover:bg-rose-500 text-white font-black px-8 py-4 rounded-xl transition-all shadow-lg shadow-rose-600/25">
                <i className="fa-solid fa-truck-medical mr-2"></i> Book Ambulance Now
              </Link>
              <a href="tel:+917388822344" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-xl transition-all">
                <i className="fa-solid fa-phone mr-2"></i> Call Emergency Line
              </a>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 bg-slate-900">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-black text-white mb-3">How Emergency Response Works</h2>
              <p className="text-slate-400">From panic to professional care in under 60 seconds.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {steps.map((step, i) => (
                <div key={i} className="relative">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-rose-600 to-transparent -translate-y-0.5 z-0" style={{ width: 'calc(100% - 2.5rem)', left: '2.5rem' }} />
                  )}
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 relative z-10">
                    <div className="text-rose-500 text-xs font-black uppercase tracking-widest mb-3">{step.num}</div>
                    <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center text-xl mb-4">
                      <i className={`fa-solid ${step.icon}`}></i>
                    </div>
                    <h3 className="text-white font-black mb-2">{step.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 px-6 bg-slate-950">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-black text-white mb-3">Emergency Services</h2>
              <p className="text-slate-400">A complete emergency care ecosystem, all connected.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((s, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-slate-600 transition-all group">
                  <div className={`w-14 h-14 bg-${s.color}-500/20 text-${s.color}-400 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
                    <i className={`fa-solid ${s.icon}`}></i>
                  </div>
                  <h3 className="text-white font-black text-xl mb-3">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">{s.desc}</p>
                  <Link href={s.href} className={`inline-flex items-center gap-2 text-${s.color}-400 font-bold text-sm hover:text-${s.color}-300 transition-colors`}>
                    {s.cta} <i className="fa-solid fa-arrow-right text-xs"></i>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Network stats */}
        <section className="bg-rose-600 py-16 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: '24/7', label: 'Dispatch Availability' },
              { val: '<15 min', label: 'Avg Response Time' },
              { val: 'BLS + ALS', label: 'Ambulance Types' },
              { val: 'ABDM', label: 'EHR Auto-Shared' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-black text-white mb-1">{s.val}</div>
                <div className="text-rose-200 text-sm font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

      </main>
      <div className="bg-slate-950">
        <Footer />
      </div>
    </div>
  );
}

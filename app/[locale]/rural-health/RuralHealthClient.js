'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const features = [
  { icon: 'fa-wifi', color: 'sky', title: 'Low Bandwidth Mode', desc: 'Platform automatically detects slow connections (2G/3G) and switches to a lightweight interface — no images, no video, still fully functional.' },
  { icon: 'fa-language', color: 'indigo', title: 'Hindi & Regional Languages', desc: 'Complete platform UI available in Hindi. Regional language support being rolled out for Marathi, Bengali, Tamil, and Telugu.' },
  { icon: 'fa-house-medical', color: 'emerald', title: 'PHC Integration Ready', desc: 'Designed to integrate with Primary Health Centres (PHCs), enabling ASHA workers and ANMs to book tests, order medicines, and upload records on behalf of patients.' },
  { icon: 'fa-user-doctor', color: 'violet', title: 'Rural Telemedicine', desc: 'Connect rural patients with urban specialists through audio/video consultation — no local doctor needed for initial triage.' },
  { icon: 'fa-truck-medical', color: 'rose', title: 'Last-Mile Medicine Delivery', desc: 'Our partner retailer network and rider fleet reaches Tier 3 towns and villages for prescription medicine delivery.' },
  { icon: 'fa-whatsapp fab', color: 'green', title: 'WhatsApp Health Bot', desc: 'Patients without smartphones can access our service via WhatsApp. Book tests, ask health questions, and receive medicine reminders — all on a basic phone.' },
];

const districtData = [
  { state: 'Uttar Pradesh', districts: ['Lucknow', 'Varanasi', 'Agra', 'Kanpur', 'Gorakhpur'] },
  { state: 'Madhya Pradesh', districts: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior'] },
  { state: 'Rajasthan', districts: ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur'] },
  { state: 'Bihar', districts: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur'] },
];

export default function RuralHealthClient() {
  const [activeState, setActiveState] = useState('Uttar Pradesh');

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1" style={{ marginTop: '140px' }}>

        {/* Hero */}
        <section className="relative bg-emerald-900 text-white py-20 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,rgba(52,211,153,0.1)_0%,transparent_60%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent" />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold mb-6">
              <i className="fa-solid fa-seedling"></i> Rural Digital Health Initiative
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
                  Bringing Specialist Care to Every <span className="text-emerald-300">Village in India</span>
                </h1>
                <p className="text-emerald-100 text-lg mb-8 leading-relaxed">
                  70% of India lives in rural areas. We are building technology that works on 2G, talks in Hindi, and reaches the last mile — with or without a smartphone.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/doctors" className="bg-white text-emerald-900 font-black px-6 py-3 rounded-xl hover:bg-emerald-50 transition-all shadow-lg">
                    <i className="fa-solid fa-user-doctor mr-2"></i> Book a Rural Consult
                  </Link>
                  <Link href="/government-partnership" className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition-all border border-emerald-600">
                    <i className="fa-solid fa-building-columns mr-2"></i> Gov Partnerships
                  </Link>
                </div>
              </div>
              <div className="hidden md:grid grid-cols-2 gap-4">
                {[
                  { icon: 'fa-users', val: '70%', label: 'Rural India' },
                  { icon: 'fa-user-doctor', val: '80%', label: 'Doctors are Urban' },
                  { icon: 'fa-phone', val: '500M+', label: 'Feature Phone Users' },
                  { icon: 'fa-pills', val: '40%', label: 'No Local Pharmacy' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-5 text-center backdrop-blur-sm">
                    <i className={`fa-solid ${s.icon} text-2xl text-emerald-300 mb-3 block`}></i>
                    <div className="text-2xl font-black">{s.val}</div>
                    <div className="text-emerald-200 text-xs font-semibold mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-slate-900 mb-3">Built for Bharat</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Every feature is purpose-built for the constraints and needs of rural and semi-urban India.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-slate-300 transition-all group">
                <div className={`w-12 h-12 bg-${f.color}-100 text-${f.color}-600 rounded-xl flex items-center justify-center text-xl mb-5 group-hover:scale-110 transition-transform`}>
                  <i className={`fa-solid ${f.icon}`}></i>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* District Coverage */}
        <section className="bg-emerald-50 border-y border-emerald-100 py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-slate-900 mb-3">Target Expansion States</h2>
              <p className="text-slate-500">We are prioritizing high-population states with the greatest healthcare access gap.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {districtData.map(s => (
                <button
                  key={s.state}
                  onClick={() => setActiveState(s.state)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    activeState === s.state
                      ? 'bg-emerald-700 text-white shadow-md'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  {s.state}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-emerald-100 p-8 shadow-sm">
              <h3 className="font-black text-slate-900 text-lg mb-4">{activeState} — Target Districts</h3>
              <div className="flex flex-wrap gap-3">
                {districtData.find(s => s.state === activeState)?.districts.map((d, i) => (
                  <span key={i} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-lg text-sm font-semibold">
                    <i className="fa-solid fa-location-dot mr-2 text-emerald-500"></i>{d}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-6">* District expansion map based on healthcare access gap analysis. Additional districts being added based on partner network growth.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Join the Rural Health Mission</h2>
            <p className="text-slate-500 mb-8">Whether you're an ASHA worker, NGO, district hospital, or state health department — we want to partner with you to bring digital health to every doorstep.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/government-partnership" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-md shadow-emerald-500/20">
                Partner with Us
              </Link>
              <a href="https://wa.me/917388822344" target="_blank" rel="noreferrer" className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-xl transition-all">
                <i className="fa-brands fa-whatsapp mr-2"></i> WhatsApp Us
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

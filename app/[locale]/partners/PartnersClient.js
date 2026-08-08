"use client";
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

const partnerTypes = [
  {
    id: 'doctors',
    title: 'Doctors & Clinics',
    icon: 'fa-user-doctor',
    color: 'bg-blue-600',
    desc: 'Join our telemedicine network to consult patients digitally, or manage your physical clinic with our ABDM-ready smart clinic software.',
    benefits: ['Zero Platform Onboarding Fee', 'AI Prescription Safety Alerts', 'Digital Patient Records', 'Increase Patient Footfall'],
    link: '/doctor/join'
  },
  {
    id: 'pharmacy',
    title: 'Retail Pharmacies',
    icon: 'fa-store',
    color: 'bg-emerald-600',
    desc: 'Transform your local medical store into a digital fulfillment center. Receive local orders directly through the Swastik Retailer App.',
    benefits: ['Increase Monthly Revenue by 30%', 'Free Inventory Management Software', 'Delivery Agent Fleet Access', 'B2B Wholesale Procurement'],
    link: '/retailer/register'
  },
  {
    id: 'labs',
    title: 'Diagnostic Labs',
    icon: 'fa-microscope',
    color: 'bg-purple-600',
    desc: 'Get online bookings for lab tests and health checkups. We manage the home sample collection while you focus on accurate diagnostics.',
    benefits: ['Home Collection Fleet Provided', 'Digital Report Delivery to Patients', 'B2B Corporate Health Tie-ups', 'NABH/NABL Priority Listing'],
    link: '/lab/register'
  },
  {
    id: 'hospitals',
    title: 'Hospitals & Nursing Homes',
    icon: 'fa-hospital',
    color: 'bg-rose-600',
    desc: 'List your hospital for SOS emergency routing, ambulance integration, and priority bed booking for critical patients.',
    benefits: ['GPS Ambulance Routing', 'Emergency Pre-alert System', 'Insurance Desk Integration', 'Digital Health Mission Ready'],
    link: '/contact'
  },
  {
    id: 'corporate',
    title: 'Enterprise Corporate Health',
    icon: 'fa-building',
    color: 'bg-indigo-600',
    desc: 'Offer comprehensive health benefits to your employees. We provide customized health plans covering medicines, telemedicine, and checkups.',
    benefits: ['Employee Health Dashboard', 'Subsidized Medicine Delivery', 'Annual Health Checkups', 'Mental Wellness Programs'],
    link: '/contact'
  },
  {
    id: 'franchise',
    title: 'Franchise Network',
    icon: 'fa-handshake',
    color: 'bg-amber-600',
    desc: 'Start a Swastik Medicare physical smart pharmacy franchise in your tier-2 or tier-3 city with full technological and supply chain backing.',
    benefits: ['Turnkey Setup & Branding', 'Centralized Inventory Supply', 'Exclusive Territory Rights', 'Omnichannel Sales Model'],
    link: '/contact'
  }
];

export default function PartnersClient() {
  const { cartCount, toggleCart } = useCart();
  const [formData, setFormData] = useState({ name: '', phone: '', type: 'doctors', city: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // In production, this would send an API request
  };

  return (
    <>
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      <main style={{ marginTop: '160px' }}>

        {/* HERO */}
        <div className="relative bg-slate-900 py-24 overflow-hidden flex flex-col md:flex-row">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.2)_0%,_transparent_60%)] pointer-events-none" />
          <div className="container mx-auto px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              <i className="fa-solid fa-network-wired" /> B2B Healthcare Network
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6">
              Partner With<br /><span className="text-blue-400">Swastik Medicare</span>
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-3xl mx-auto mb-12">
              Join Eastern UP's fastest-growing digital healthcare network. We are building the infrastructure that connects doctors, pharmacies, labs, and patients.
            </p>
          </div>
        </div>

        {/* PARTNER TYPES */}
        <div className="container mx-auto px-8 py-20 -mt-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {partnerTypes.map((partner) => (
              <div key={partner.id} className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 hover:-translate-y-2 transition-transform duration-300">
                <div className={`w-14 h-14 rounded-2xl ${partner.color} flex items-center justify-center text-white text-2xl shadow-lg shadow-${partner.color.split('-')[1]}-500/30 mb-6`}>
                  <i className={`fa-solid ${partner.icon}`} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-3">{partner.title}</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 h-20">{partner.desc}</p>
                
                <ul className="space-y-2 mb-8">
                  {partner.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-bold text-slate-600">
                      <i className={`fa-solid fa-check text-${partner.color.split('-')[1]}-500 mt-0.5`} /> {b}
                    </li>
                  ))}
                </ul>

                <Link href={partner.link} className={`block text-center w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] text-white transition-all ${partner.color} hover:opacity-90`}>
                  Apply as Partner
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* B2B CONTACT FORM */}
        <div className="bg-slate-50 py-24 border-t border-slate-100">
          <div className="container mx-auto px-8 max-w-4xl">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-5/12 bg-slate-900 text-white p-10 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 relative z-10">Let's Grow Together</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8 relative z-10">Fill out this form and our B2B onboarding team will get back to you within 24 hours to discuss integration opportunities.</p>
                
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-phone text-blue-400 text-xs" /></div>
                    <span className="text-sm font-bold">+91 79921 22974</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-envelope text-blue-400 text-xs" /></div>
                    <span className="text-sm font-bold">partners@swastikmed.online</span>
                  </div>
                </div>
              </div>

              <div className="md:w-7/12 p-10">
                {submitted ? (
                  <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                      <i className="fa-solid fa-check text-4xl text-emerald-500" />
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mb-2">Request Received!</h4>
                    <p className="text-slate-500 text-sm">Our B2B team will contact you shortly to complete your onboarding process.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Business / Clinic Name</label>
                      <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900" placeholder="e.g. Swastik Medicare Lab" />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                        <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900" placeholder="+91" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">City</label>
                        <input type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900" placeholder="e.g. Gorakhpur" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Partnership Type</label>
                      <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900">
                        {partnerTypes.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-4 font-black uppercase tracking-widest text-[10px] transition-all mt-4 shadow-lg shadow-blue-500/30">
                      Submit Partner Request
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}

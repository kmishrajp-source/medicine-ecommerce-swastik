"use client";
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

const programs = [
  {
    id: 'diabetes',
    title: 'Diabetes Management',
    icon: 'fa-droplet',
    color: 'bg-rose-500',
    textColor: 'text-rose-500',
    borderColor: 'border-rose-200',
    desc: 'Comprehensive care for Type 1 & Type 2 Diabetes, integrating continuous glucose monitoring, endocrinologist consultations, and automated medicine refills.',
    features: ['Auto Medicine Refills', 'Diet & Nutrition Plans', 'At-Home HbA1c Tests', 'Endocrinologist Access']
  },
  {
    id: 'womens-health',
    title: 'Women\'s Health & Maternity',
    icon: 'fa-person-pregnant',
    color: 'bg-pink-500',
    textColor: 'text-pink-500',
    borderColor: 'border-pink-200',
    desc: 'Dedicated care pathways for PCOS/PCOD, fertility tracking, prenatal care, and post-partum support led by top gynecologists.',
    features: ['PCOD/PCOS Reversal', 'Pregnancy Tracking', 'Gynecology Consults', 'Nutritional Support']
  },
  {
    id: 'cardiac',
    title: 'Cardiac Care',
    icon: 'fa-heart-pulse',
    color: 'bg-red-500',
    textColor: 'text-red-500',
    borderColor: 'border-red-200',
    desc: 'Post-operative cardiac care and hypertension management with remote monitoring of vitals and immediate SOS protocols.',
    features: ['BP Monitoring Logs', 'Cardiologist Reviews', 'Post-Op Medicine Packs', 'SOS Ambulance Routing']
  },
  {
    id: 'mental-health',
    title: 'Mental Wellness',
    icon: 'fa-brain',
    color: 'bg-purple-500',
    textColor: 'text-purple-500',
    borderColor: 'border-purple-200',
    desc: 'Confidential online counseling, therapy, and psychiatric consultations focusing on anxiety, depression, and stress management.',
    features: ['Confidential Therapy', 'Psychiatrist Access', 'Mood Tracking', 'Meditation Resources']
  },
  {
    id: 'corporate',
    title: 'Corporate Health Plan',
    icon: 'fa-building-user',
    color: 'bg-indigo-500',
    textColor: 'text-indigo-500',
    borderColor: 'border-indigo-200',
    desc: 'Enterprise solutions for employee health benefits, offering subsidized medicine delivery, annual health checkups, and tele-consults.',
    features: ['Annual Health Checks', 'Employee Wallet', 'Occupational Health', 'Dashboard for HR']
  },
  {
    id: 'senior',
    title: 'Senior Citizen Care',
    icon: 'fa-person-cane',
    color: 'bg-amber-500',
    textColor: 'text-amber-500',
    borderColor: 'border-amber-200',
    desc: 'Tailored care for the elderly with pill organizers, assisted telemedicine, home diagnostics, and priority emergency response.',
    features: ['Pill Organizers', 'Assisted Telemedicine', 'Home Lab Tests', 'Priority Emergency']
  }
];

export default function ProgramsClient() {
  const { cartCount, toggleCart } = useCart();

  return (
    <>
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      <main style={{ marginTop: '160px' }}>

        {/* HERO */}
        <div className="relative bg-slate-900 py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(236,72,153,0.15)_0%,_transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.15)_0%,_transparent_60%)] pointer-events-none" />
          <div className="container mx-auto px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-pink-500/20 border border-pink-400/30 text-pink-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              <i className="fa-solid fa-notes-medical" /> Clinical Pathways
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6">
              Healthcare <br /><span className="text-pink-400">Programs</span>
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-3xl mx-auto">
              Specialized, outcome-driven care programs combining specialized doctors, regular diagnostics, and intelligent medication management.
            </p>
          </div>
        </div>

        {/* PROGRAMS GRID */}
        <div className="container mx-auto px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program) => (
              <div key={program.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 hover:shadow-xl hover:border-slate-300 transition-all group flex flex-col">
                <div className={`w-16 h-16 ${program.color} rounded-2xl flex items-center justify-center mb-6 text-white text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                  <i className={`fa-solid ${program.icon}`} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-3">{program.title}</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1">{program.desc}</p>
                
                <div className="space-y-3 mb-8">
                  {program.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <i className={`fa-solid fa-circle-check text-[14px] ${program.textColor}`} />
                      <span className="text-sm font-bold text-slate-700">{f}</span>
                    </div>
                  ))}
                </div>

                <button className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all border-2 ${program.borderColor} ${program.textColor} hover:${program.color} hover:text-white`}>
                  Explore Program
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CORPORATE CTA */}
        <div className="bg-slate-50 py-20 border-t border-slate-100">
          <div className="container mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl bg-white p-12 rounded-3xl shadow-sm border border-slate-200">
            <div>
              <div className="inline-block bg-indigo-100 text-indigo-700 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full mb-4">For Enterprises</div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Upgrade Your Employee Health Benefits</h2>
              <p className="text-slate-500 max-w-lg">Reduce absenteeism and boost productivity by offering your team comprehensive access to telemedicine, free medicine delivery, and annual corporate health checkups.</p>
            </div>
            <Link href="/partners" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex-shrink-0 text-center">
              <i className="fa-solid fa-briefcase mr-2" /> Contact Sales
            </Link>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}

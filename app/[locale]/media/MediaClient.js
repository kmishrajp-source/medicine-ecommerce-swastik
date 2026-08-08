"use client";
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

const categories = ['All', 'Press Release', 'Blog', 'Innovation', 'Partnership', 'Events'];

const articles = [
  {
    id: 1,
    category: 'Innovation',
    date: 'August 2026',
    title: 'Swastik Medicare Launches AI Prescription Safety Engine for Eastern UP',
    excerpt: 'The proprietary AI engine analyzes uploaded prescriptions in real time, flagging dangerous drug interactions and dosage anomalies before any medicine is dispensed.',
    readTime: '4 min read',
    icon: 'fa-robot',
    color: 'bg-indigo-600',
  },
  {
    id: 2,
    category: 'Press Release',
    date: 'August 2026',
    title: 'Swastik Medicare Integrates ABDM-Ready Digital Health Architecture',
    excerpt: 'Gorakhpur-based HealthTech platform becomes one of the first in Eastern UP to build ABDM-aligned infrastructure for ABHA number support and consent-based health records.',
    readTime: '3 min read',
    icon: 'fa-shield-halved',
    color: 'bg-blue-600',
  },
  {
    id: 3,
    category: 'Blog',
    date: 'July 2026',
    title: 'Why AI is the Future of Prescription Safety in India',
    excerpt: 'Medication errors cause over 5 million preventable deaths globally each year. This article explores how AI-powered prescription analysis can dramatically reduce this number in India.',
    readTime: '7 min read',
    icon: 'fa-file-prescription',
    color: 'bg-emerald-600',
  },
  {
    id: 4,
    category: 'Partnership',
    date: 'July 2026',
    title: 'Swastik Medicare Onboards 150+ Pharmacy Partners in Gorakhpur',
    excerpt: 'The platform has successfully partnered with 150+ local medical stores, creating a dense fulfillment network for same-day medicine delivery across Gorakhpur city.',
    readTime: '3 min read',
    icon: 'fa-shop',
    color: 'bg-amber-600',
  },
  {
    id: 5,
    category: 'Blog',
    date: 'June 2026',
    title: 'Rural Healthcare Access: How Telemedicine Can Bridge India\'s Medical Gap',
    excerpt: '85% of India\'s specialists are concentrated in 10 cities, leaving rural populations with no access to quality care. Here\'s how Swastik Medicare is solving this.',
    readTime: '6 min read',
    icon: 'fa-globe-asia',
    color: 'bg-rose-600',
  },
  {
    id: 6,
    category: 'Innovation',
    date: 'June 2026',
    title: 'Introducing the Swastik Medicare Homeopathy Platform',
    excerpt: 'We launch India\'s first integrated Homeopathy Doctor + Medicine directory, connecting verified Homeopathic practitioners with patients seeking alternative medicine consultations.',
    readTime: '4 min read',
    icon: 'fa-leaf',
    color: 'bg-teal-600',
  },
];

export default function MediaClient() {
  const { cartCount, toggleCart } = useCart();
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All' ? articles : articles.filter(a => a.category === activeCategory);

  return (
    <>
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      <main style={{ marginTop: '160px' }}>

        {/* HERO */}
        <div className="relative bg-slate-900 py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(79,70,229,0.2)_0%,_transparent_70%)] pointer-events-none" />
          <div className="container mx-auto px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              <i className="fa-solid fa-newspaper" /> News & Media Centre
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6">
              Latest<br /><span className="text-indigo-400">News & Insights</span>
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto">
              Press releases, healthcare insights, technology innovation updates, and partnership announcements from Swastik Medicare.
            </p>
          </div>
        </div>

        {/* MEDIA CONTACTS */}
        <div className="container mx-auto px-8 -mt-8 relative z-10 mb-20">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Media Enquiries</div>
              <div className="text-xl font-black text-slate-900">press@swastikmed.online</div>
              <div className="text-slate-500 text-sm mt-1">Responses within 48 hours for verified press</div>
            </div>
            <a href="mailto:press@swastikmed.online" className="bg-slate-900 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex-shrink-0">
              <i className="fa-solid fa-envelope mr-2" /> Contact Press Team
            </a>
          </div>
        </div>

        {/* FILTERS + ARTICLES */}
        <div className="container mx-auto px-8 pb-24">
          <div className="flex flex-wrap gap-2 mb-12">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(article => (
              <article key={article.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group cursor-pointer">
                <div className={`${article.color} h-2 w-full`} />
                <div className="p-8">
                  <div className="flex items-center justify-between mb-5">
                    <div className={`${article.color} text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full`}>{article.category}</div>
                    <span className="text-slate-400 text-xs font-bold">{article.date}</span>
                  </div>
                  <div className={`w-12 h-12 ${article.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <i className={`fa-solid ${article.icon} text-xl text-white`} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight mb-3 group-hover:text-indigo-600 transition-colors">{article.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{article.readTime}</span>
                    <button className="text-indigo-600 hover:text-indigo-800 font-black text-xs uppercase tracking-widest flex items-center gap-1">
                      Read More <i className="fa-solid fa-arrow-right text-[10px]" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* MEDIA KIT CTA */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 py-20 text-white text-center">
          <div className="container mx-auto px-8">
            <i className="fa-solid fa-box-open text-5xl mb-6 block opacity-80" />
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Media Kit Available</h2>
            <p className="text-indigo-200 text-lg font-medium max-w-xl mx-auto mb-10">Logos, brand assets, executive photos, company fact sheet, and technology overview — all available on request for verified media.</p>
            <a href="mailto:press@swastikmed.online?subject=Media Kit Request" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-all">
              <i className="fa-solid fa-download" /> Request Media Kit
            </a>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}

"use client";
import { Link } from '@/i18n/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import MotivationalVideo from "@/components/MotivationalVideo";
import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';
import StatCounter from "@/components/StatCounter";
import BenefitsSection from "@/components/BenefitsSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import StickyContact from "@/components/StickyContact";

export default function Home() {
  const { cartCount, toggleCart, addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [userPhone, setUserPhone] = useState("");
  
  const t = useTranslations('Homepage');
  const tConv = useTranslations('Conversion');
  const tTrust = useTranslations('Trust');
  const tEmergency = useTranslations('Emergency');
  const tSub = useTranslations('Subscription');
  const tContact = useTranslations('Contact');
  const tSections = useTranslations('Sections');
  const tReviews = useTranslations('Reviews');

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => {
      if (data.success) setProducts(data.products);
    });
  }, []);

  const bestSelling = products.slice(0, 4);
  const trending = products.slice(4, 8);
  const essentials = products.slice(8, 12);

  return (
    <>
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      <main style={{ marginTop: '80px' }}>

        {/* HIGH-CONVERSION HERO (SHOPIFY INSPIRED) */}
        <div className="relative bg-[#f8fafc] py-24 pb-40 overflow-hidden">
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/5 rounded-l-[200px] -z-10 translate-x-20"></div>
             
             <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-center md:text-left">
                    <span className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 inline-block">
                        <i className="fa-solid fa-bolt mr-2"></i> Join 500+ Local Healthcare Leaders
                    </span>
                    <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8 uppercase">
                        {tConv('hero_title').split(' ').map((word, i) => (
                            <span key={i} className={word.toLowerCase() === 'patients' || word.toLowerCase() === 'customers' ? 'text-indigo-600' : ''}>
                                {word}{' '}
                            </span>
                        ))}
                    </h1>
                    <p className="text-xl font-bold text-slate-500 mb-10 max-w-lg mx-auto md:mx-0">
                        {tConv('hero_subtitle')}
                    </p>

                    <div className="bg-white p-2 rounded-[40px] shadow-2xl shadow-indigo-200 border border-slate-100 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto md:mx-0">
                        <input 
                            type="tel" 
                            placeholder={tConv('phone_placeholder')}
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value)}
                            className="flex-1 p-5 rounded-[30px] bg-slate-50 border-none outline-none text-slate-700 font-bold"
                        />
                        <button className="bg-slate-900 text-white px-8 py-5 rounded-[30px] font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10">
                            {tConv('start_listing')}
                        </button>
                    </div>
                    <p className="mt-6 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                        <i className="fa-solid fa-shield-check mr-2"></i> {tConv('trust_line')}
                    </p>
                </div>

                <div className="flex-1 relative hidden md:block">
                     <div className="bg-white rounded-[60px] p-8 shadow-2xl border border-slate-100 rotate-3 transform-gpu relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                             <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black">S</div>
                             <div>
                                <div className="text-sm font-black text-slate-900">Dr. Swastik Connect</div>
                                <div className="text-[10px] font-bold text-slate-400">Online Specialist</div>
                             </div>
                        </div>
                        <div className="space-y-4">
                             <div className="h-4 w-3/4 bg-slate-50 rounded-full"></div>
                             <div className="h-4 w-1/2 bg-slate-50 rounded-full"></div>
                             <div className="grid grid-cols-2 gap-4 mt-8">
                                <div className="h-20 bg-indigo-50 rounded-3xl border-2 border-dashed border-indigo-100 flex items-center justify-center">
                                    <i className="fa-solid fa-phone text-indigo-300"></i>
                                </div>
                                <div className="h-20 bg-emerald-50 rounded-3xl border-2 border-dashed border-emerald-100 flex items-center justify-center">
                                    <i className="fa-brands fa-whatsapp text-emerald-300"></i>
                                </div>
                             </div>
                        </div>
                     </div>
                     <div className="absolute top-20 -left-10 w-full h-full bg-indigo-600/5 rounded-[60px] -rotate-3"></div>
                </div>
             </div>
        </div>

        {/* SOCIAL PROOF & STATS */}
        <div className="-mt-20 relative z-20 container px-8 mb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <StatCounter end={200} label={tConv('doctors')} icon="fa-user-doctor" />
                 <StatCounter end={150} label={tConv('medical_stores')} icon="fa-shop" />
                 <StatCounter end={1000} label={tConv('patients')} icon="fa-users" />
            </div>
        </div>

        {/* BENEFITS SECTION */}
        <BenefitsSection />

        {/* CONNECTION FLOW (VISUAL) */}
        <div className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">{tConv('flow_title')}</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">How it works for your patients</p>
                </div>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative">
                    {/* Connection Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-indigo-100 -z-10 hidden md:block"></div>
                    
                    {[
                        { step: '01', title: tConv('flow_step_1'), icon: 'fa-magnifying-glass' },
                        { step: '02', title: tConv('flow_step_2'), icon: 'fa-hand-pointer' },
                        { step: '03', title: tConv('flow_step_3'), icon: 'fa-phone-flip' }
                    ].map((step, i) => (
                        <div key={i} className="bg-white p-8 rounded-[40px] border-2 border-indigo-50 flex flex-col items-center text-center w-full md:w-64 relative group hover:border-indigo-500 transition-all">
                            <div className="absolute -top-4 -right-4 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-xs shadow-lg">{step.step}</div>
                            <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center text-2xl mb-6 shadow-xl shadow-slate-900/20 group-hover:bg-indigo-600 transition-colors">
                                <i className={`fa-solid ${step.icon}`}></i>
                            </div>
                            <h3 className="text-xl font-black text-slate-900">{step.title}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* SMART TOOLS (INTEGRATED) */}
        <div className="container px-8">
          <SectionTitle title="⚡ Smart Healthcare Tools" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', margin: '40px 0' }}>
            <FeatureCard 
              href="/symptom-helper" 
              icon="fa-wand-sparkles" 
              title="Symptom Helper"
              desc="AI specialist matching tool."
              color="#4F46E5"
            />
            <FeatureCard 
              href="/blog" 
              icon="fa-newspaper" 
              title="Health Blog"
              desc="Disease guides & local tips."
              color="#F59E0B"
            />
            <FeatureCard 
              href="/doctors" 
              icon="fa-user-doctor" 
              title="Find Doctors"
              desc="Verified local specialists."
              color="#3B82F6"
            />
            <FeatureCard 
              href="/pharmacy" 
              icon="fa-shop" 
              title="Medical Stores"
              desc="Find medicines near you."
              color="#10B981"
            />
          </div>
        </div>

        {/* SPEED & TRUST MODULE */}
        <div className="py-20 bg-slate-900 text-white overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center gap-16">
                 <div className="flex-1">
                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-8 leading-none">Built for <span className="text-indigo-400">Speed & Trust</span></h2>
                    <div className="space-y-8">
                         <div className="flex gap-6">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0"><i className="fa-solid fa-bolt text-indigo-400"></i></div>
                            <div>
                                <h4 className="text-lg font-black mb-1">Fast Loading</h4>
                                <p className="text-slate-400 font-bold text-sm">Optimized for 2G/3G speeds in rural areas.</p>
                            </div>
                         </div>
                         <div className="flex gap-6">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0"><i className="fa-solid fa-circle-check text-emerald-400"></i></div>
                            <div>
                                <h4 className="text-lg font-black mb-1">99% Uptime Guarantee</h4>
                                <p className="text-slate-400 font-bold text-sm">Always available for your patients and customers.</p>
                            </div>
                         </div>
                         <div className="flex gap-6">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0"><i className="fa-solid fa-user-lock text-amber-400"></i></div>
                            <div>
                                <h4 className="text-lg font-black mb-1">No Login Required</h4>
                                <p className="text-slate-400 font-bold text-sm">Patients can search and connect without registration friction.</p>
                            </div>
                         </div>
                    </div>
                 </div>
                 <div className="flex-1 relative">
                    <div className="bg-gradient-to-tr from-indigo-600 to-indigo-400 p-12 rounded-[60px] shadow-2xl relative z-10">
                         <div className="text-6xl font-black mb-4">A+</div>
                         <div className="text-[10px] font-black uppercase tracking-[10px] opacity-60">Performance Rating</div>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-full h-full bg-white/5 rounded-[60px] rotate-6 border border-white/10"></div>
                 </div>
            </div>
        </div>

        {/* PRICING PLANS */}
        <PricingSection />

        {/* FAQ SECTION */}
        <FAQSection />

        {/* FINAL CTA REPEAT */}
        <div className="py-32 bg-indigo-600 text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
             <div className="relative z-10 max-w-4xl mx-auto px-8">
                <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter mb-8 leading-none">{tConv('join_today')}</h2>
                <button className="bg-white text-indigo-600 px-12 py-6 rounded-[40px] font-black uppercase tracking-widest text-sm hover:bg-slate-100 transition-all shadow-2xl">
                    Get Started Now
                </button>
                <div className="mt-8 text-white/60 font-black uppercase tracking-widest text-[10px]">Trusted by thousands in Uttar Pradesh</div>
             </div>
        </div>

        {/* STICKY CONTACT (MOBILE) */}
        <StickyContact />

        <div className="container">
          <AdBanner position="Home-Banner" />
          
          {/* BEST SELLING */}
          <SectionTitle title={`🔥 ${tSections('best_selling')}`} />
          <ProductGrid products={bestSelling} addToCart={addToCart} />

          {/* REVIEWS */}
          <SectionTitle title={`💬 ${t('customer_reviews')}`} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '60px' }}>
            {[
              { name: tReviews('review_1_name'), text: tReviews('review_1_text'), loc: tReviews('review_1_loc') },
              { name: tReviews('review_2_name'), text: tReviews('review_2_text'), loc: tReviews('review_2_loc') },
              { name: tReviews('review_3_name'), text: tReviews('review_3_text'), loc: tReviews('review_3_loc') }
            ].map((review, i) => (
              <div key={i} style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
                <div style={{ color: '#fbbf24', marginBottom: '10px' }}><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i></div>
                <p style={{ fontStyle: 'italic', marginBottom: '15px', color: '#555' }}>"{review.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b' }}>{review.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{review.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#999' }}>{review.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function SectionTitle({ title }) {
  return (
    <div className="flex items-center gap-6 my-16 px-8">
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter whitespace-nowrap">{title}</h2>
        <div className="h-0.5 bg-slate-100 flex-1"></div>
    </div>
  );
}

function ProductGrid({ products, addToCart }) {
  const t = useTranslations('Homepage');
  if (products.length === 0) return <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>{t('searching')}</div>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-8 mb-20">
      {products.map(p => (
        <ProductCard key={p.id} product={p} onAdd={addToCart} />
      ))}
    </div>
  );
}

function FeatureCard({ href, icon, title, desc, color }) {
  return (
    <Link href={href} className="group bg-white p-10 rounded-[40px] border border-slate-50 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-3xl mb-8 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 font-bold text-sm tracking-tight">{desc}</p>
    </Link>
  );
}

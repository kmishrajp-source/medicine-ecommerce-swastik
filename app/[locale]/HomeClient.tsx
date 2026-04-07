"use client";
import { Link } from '@/i18n/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

const MotivationalVideo = dynamic(() => import('@/components/MotivationalVideo'), { ssr: false });
const StatCounter = dynamic(() => import('@/components/StatCounter'), { ssr: true });
const BenefitsSection = dynamic(() => import('@/components/BenefitsSection'), { ssr: true });
const PricingSection = dynamic(() => import('@/components/PricingSection'), { ssr: true });
const FAQSection = dynamic(() => import('@/components/FAQSection'), { ssr: true });
const LeadCapturePopup = dynamic(() => import('@/components/LeadCapturePopup'), { ssr: false });

export default function HomeClient() {
  const { cartCount, toggleCart, addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [topDoctors, setTopDoctors] = useState<any[]>([]);
  const [newDoctors, setNewDoctors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userPhone, setUserPhone] = useState("");
  
  const t = useTranslations('Homepage');
  const tConv = useTranslations('Conversion');
  const tTrust = useTranslations('Trust');
  const tEmergency = useTranslations('Emergency');
  const tSub = useTranslations('Subscription');
  const tContact = useTranslations('Contact');
  const tSections = useTranslations('Sections');
  const tReviews = useTranslations('Reviews');

  const [location, setLocation] = useState("Gorakhpur");

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`);
            const data = await res.json();
            if (data.city) setLocation(data.city);
          } catch (e) {
            console.log("Location detection failed, fallback to Gorakhpur");
          }
        },
        () => console.log("Geolocation permission denied")
      );
    }
  }, []);

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => {
      if (data.success) setProducts(data.products);
    });

    // Module 10: Growth Data Fetching
    fetch('/api/doctors?limit=4').then(res => res.json()).then(data => {
      if (data.success) setTopDoctors(data.doctors);
    });

    fetch('/api/doctors?limit=4&sort=newest').then(res => res.json()).then(data => {
      if (data.success) setNewDoctors(data.doctors);
    });
  }, []);

  const bestSelling = products.slice(0, 4);
  const trending = products.slice(4, 8);
  const essentials = products.slice(8, 12);

  return (
    <>
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      <main style={{ marginTop: '160px' }}>

        {/* HIGH-CONVERSION HERO (SWASTIK BRANDING) */}
        <div className="relative bg-[#f8fafc] py-32 pb-48 overflow-hidden">
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/5 rounded-l-[200px] -z-10 translate-x-20"></div>
             
             <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-center md:text-left">
                    <span className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 inline-block shadow-sm">
                        <i className="fa-solid fa-bolt mr-2 text-indigo-500"></i> {t('local_network')}
                    </span>
                    <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8 uppercase">
                        {t('medical_care')} <br/> <span className="text-indigo-600">{t('delivered_in')}</span> <br/> {t('mins')}
                    </h1>
                    <p className="text-xl font-bold text-slate-500 mb-10 max-w-lg mx-auto md:mx-0">
                        {t('hero_subtitle')}
                    </p>

                    {/* Module 10: Smart Intent Search Bar */}
                    <div className="relative max-w-2xl mx-auto md:mx-0 mb-12 group">
                        <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                        <form action={`/doctors`} className="relative flex items-center bg-white p-2 rounded-[2.5rem] shadow-2xl border-4 border-white group-focus-within:border-indigo-100 transition-all overflow-hidden">
                            <div className="flex-1 flex items-center px-6">
                                <i className="fa-solid fa-magnifying-glass text-slate-300 mr-4"></i>
                                <input 
                                    name="q"
                                    type="text" 
                                    placeholder="Search by specialty, symptom (e.g. lungs, skin)..." 
                                    className="w-full bg-transparent border-none focus:ring-0 text-slate-900 font-bold placeholder:text-slate-400 py-4"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="bg-slate-900 text-white px-10 py-4 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all flex items-center gap-2">
                                {t('search')} <i className="fa-solid fa-arrow-right"></i>
                            </button>
                        </form>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-12 justify-center" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '40px', width: '100%' }}>
                        <Link href="/doctors" className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 text-center" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '180px', marginRight: '15px' }}>
                            {t('find_doctor')}
                        </Link>
                        <Link href="/shop-medicines" className="bg-indigo-600 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200/20 text-center" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '180px', marginRight: '15px' }}>
                            {t('shop_medicines')}
                        </Link>
                        <Link href="/upload-prescription" className="bg-white text-slate-900 border-2 border-slate-100 px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:border-indigo-600 transition-all text-center" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '180px' }}>
                            {t('upload_rx')}
                        </Link>
                    </div>

                    {/* Urgency & Trust Badges */}
                    <div className="mt-8 space-y-4">
                        <p className="text-[12px] font-black text-indigo-600 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                             <i className="fa-solid fa-bolt animate-pulse"></i> {t('connect_speed')}
                        </p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                             <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><i className="fa-solid fa-circle-check text-emerald-500"></i> {t('no_login_required')}</span>
                             <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><i className="fa-solid fa-truck-fast text-indigo-500"></i> {t('free_delivery')}</span>
                             <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><i className="fa-solid fa-circle-check text-emerald-500"></i> {t('verified_medicines')}</span>
                        </div>
                    </div>

                    {/* Explainer Video Block */}
                    <div className="mt-12 p-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-indigo-100/20 max-w-md mx-auto md:mx-0 group cursor-pointer hover:border-indigo-200 transition-all">
                         <div className="flex items-center gap-4 mb-4">
                              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                   <i className="fa-solid fa-play ml-1"></i>
                              </div>
                              <div>
                                   <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{t('how_it_works')}</div>
                                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('search_whatsapp_call')}</div>
                              </div>
                         </div>
                         <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-50">
                              <img src="https://images.unsplash.com/photo-1576091160550-2173dad99978?auto=format&fit=crop&w=400" alt="Healthcare medical facility" className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                              <div className="absolute inset-0 flex items-center justify-center text-indigo-600/50 text-4xl group-hover:text-indigo-600 transition-colors">
                                   <i className="fa-solid fa-video"></i>
                              </div>
                         </div>
                    </div>
                </div>

                <div className="flex-1 relative hidden md:block">
                     <div className="bg-white rounded-[60px] p-8 shadow-2xl border border-slate-100 rotate-3 transform-gpu relative z-10 transition-transform hover:rotate-0 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black shadow-lg">S</div>
                                <div>
                                    <div className="text-sm font-black text-slate-900">Dr. Vivek Sharma</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cardiologist • Golghar</div>
                                </div>
                            </div>
                            <div className="bg-emerald-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase shadow-lg shadow-emerald-100 animate-pulse">{t('available_now')}</div>
                        </div>
                        <div className="space-y-4">
                             <div className="h-4 w-3/4 bg-slate-50 rounded-full"></div>
                             <div className="h-4 w-1/2 bg-slate-50 rounded-full"></div>
                             <div className="grid grid-cols-2 gap-4 mt-8">
                                <div className="h-24 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-slate-900 transition-all">
                                    <i className="fa-solid fa-phone text-slate-300 group-hover:text-white transition-colors"></i>
                                    <span className="text-[8px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest">{t('call')}</span>
                                </div>
                                <div className="h-24 bg-emerald-50 rounded-3xl border border-emerald-100 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-emerald-500 transition-all">
                                    <i className="fa-brands fa-whatsapp text-emerald-300 group-hover:text-white transition-colors"></i>
                                    <span className="text-[8px] font-black text-emerald-400 group-hover:text-white uppercase tracking-widest">{t('whatsapp')}</span>
                                </div>
                             </div>
                        </div>
                     </div>
                     <div className="absolute top-20 -left-10 w-full h-full bg-indigo-600/5 rounded-[60px] -rotate-3 -z-10 border border-indigo-100/20"></div>
                </div>
             </div>
        </div>

        {/* SOCIAL PROOF & STATS (CONSOLIDATED) */}
        <div className="-mt-20 relative z-30 container px-8 mb-20">
            <div className="bg-white rounded-[40px] p-12 shadow-2xl shadow-indigo-100/50 border border-slate-100">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { count: "200+", label: "Verified Doctors", icon: "fa-user-doctor", color: "text-blue-400" },
                            { count: "5000+", label: "Patient Inquiries", icon: "fa-hospital-user", color: "text-emerald-400" },
                            { count: "150+", label: "Medical Stores", icon: "fa-shop", color: "text-indigo-400" },
                            { count: location, label: "Live Service", icon: "fa-map-location-dot", color: "text-rose-400" }
                        ].map((stat, i) => (
                            <div key={i} className="text-center group">
                                <div className={`w-12 h-12 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center text-xl ${stat.color} mb-4 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner`}>
                                    <i className={`fa-solid ${stat.icon}`}></i>
                                </div>
                                <div className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">{stat.count}</div>
                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                </div>
                
                {/* Local Urgency Bar */}
                <div className="mt-12 pt-12 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                     <div className="flex items-center gap-4">
                          <div className="flex -space-x-4">
                               {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-sm"><img src={`https://i.pravatar.cc/100?u=${i}`} alt={`Patient Avatar ${i}`} /></div>)}
                          </div>
                          <div className="text-xs font-bold text-slate-500 italic">"Joined Swastik in the last 24 hours"</div>
                     </div>
                     <div className="bg-amber-50 text-amber-600 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-2">
                          <i className="fa-solid fa-clock animate-pulse"></i> Only 5 doctor slots left in {location}
                     </div>
                </div>
            </div>
        </div>


        {/* BEST SELLING (Elevated) */}
        <div className="container px-8">
          <SectionTitle title={`🔥 ${tSections('best_selling')}`} />
          <ProductGrid products={bestSelling} addToCart={addToCart} />
        </div>

        {/* BENEFITS SECTION */}
        <BenefitsSection />

        {/* Module 10: Growth Sections */}
        <div className="container px-8 mb-24">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">Platform Excellence</span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase mb-0">Top-Rated <br/> <span className="text-blue-600">Specialists</span></h2>
                </div>
                <Link href="/doctors" className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 pb-2 hover:border-blue-600 hover:text-blue-600 transition-all">
                    View All Doctors <i className="fa-solid fa-arrow-right-long ml-2"></i>
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {topDoctors.map(doctor => (
                    <div key={doctor.id} className="relative group">
                        <Link href={`/doctors/${doctor.id}`} className="absolute inset-0 z-10"></Link>
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm group-hover:shadow-2xl transition-all h-full flex flex-col">
                            <div className="w-20 h-20 bg-slate-900 rounded-3xl mb-6 overflow-hidden border-4 border-slate-50 shadow-lg">
                                <img src={doctor.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=0f172a&color=fff`} className="w-full h-full object-cover" />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 mb-1 leading-tight">{doctor.name}</h4>
                            <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest mb-6">{doctor.specialization}</p>
                            <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                                <div className="text-amber-500 font-black text-xs flex items-center gap-1"><i className="fa-solid fa-star"></i> {doctor.rating || '4.9'}</div>
                                <div className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{doctor.experience || '12+'} Yrs</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-slate-900 py-32 mb-20 overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600"></div>
            <div className="container px-8 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4 leading-[0.9]">Recently <span className="text-blue-500">Joined</span></h2>
                    <p className="text-slate-500 font-black text-xs uppercase tracking-[0.5em]">New medical partners in Gorakhpur</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {newDoctors.map(doctor => (
                        <div key={doctor.id} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-all group">
                             <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-900/20">
                                    {doctor.name.charAt(0)}
                                </div>
                                <div>
                                    <h5 className="text-sm font-black text-white uppercase tracking-tight">{doctor.name}</h5>
                                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{doctor.specialization}</p>
                                </div>
                             </div>
                             <Link href={`/doctors/${doctor.id}`} className="block w-full bg-white/10 text-white font-black py-3 rounded-xl text-[8px] uppercase tracking-[0.2em] text-center hover:bg-white hover:text-slate-900 transition-all">
                                View Listing
                             </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="container px-8 mb-20">
          <MotivationalVideo 
            title="Sophisticated Healthcare, Simple Connection" 
            description="Watch how Swastik Medicare is bridging the gap between patients and healthcare providers in Gorakhpur."
            videoUrl="https://www.youtube.com/embed/90ce3aCwpnw" 
            ctaText="Find Doctors Now"
            ctaLink="/doctors"
          />
        </div>

        {/* SMART TOOLS (EXPANDED) */}
        <div className="container px-8 py-20">
          <SectionTitle title="⚡ Smart Healthcare Tools" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-12">
            <FeatureCard 
              href="/ai-assistant" 
              icon="fa-robot" 
              title="AI Medicine Assistant"
              desc="Dosages & Side Effects"
              color="#3B82F6"
            />
            <FeatureCard 
              href="/symptom-checker" 
              icon="fa-stethoscope" 
              title="Symptom Checker"
              desc="Instant Wellness Guidance"
              color="#4F46E5"
            />
            <FeatureCard 
              href="/prescription-analyzer" 
              icon="fa-file-medical" 
              title="Rx Analyzer"
              desc="Analyze prescriptions safely"
              color="#059669"
            />
            <FeatureCard 
              href="/drug-interaction-checker" 
              icon="fa-pills" 
              title="Interaction Checker"
              desc="Check drug interactions"
              color="#D97706"
            />
            <FeatureCard 
              href="/advertise" 
              icon="fa-ad" 
              title="Advertise With Us"
              desc="Grow your healthcare brand"
              color="#7C3AED"
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

        {/* FAQ SECTION */}
        <FAQSection />

        {/* PARTNER ECOSYSTEM VIDEOS (Moved Down) */}
        <div className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-8">
                <SectionTitle title="🤝 Join Our Growing Healthcare Network" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    <MotivationalVideo 
                        title="For Hospitals" 
                        description="Digitize your patient intake and fulfillment."
                        videoUrl="https://www.youtube.com/embed/JS08a73wnAM"
                        ctaText="Register Hospital"
                        ctaLink="/hospital/register"
                    />
                    <MotivationalVideo 
                        title="For Insurance Providers" 
                        description="Verify claims and manage benefits in real-time."
                        videoUrl="https://www.youtube.com/embed/5yiySDLhLyk"
                        ctaText="Become a Provider"
                        ctaLink="/insurance/register"
                    />
                    <MotivationalVideo 
                        title="For Manufacturers" 
                        description="Supply medicines and manage your global catalog."
                        videoUrl="https://www.youtube.com/embed/kD56e6tao0o"
                        ctaText="Join Supply Chain"
                        ctaLink="/manufacturer/register"
                    />
                </div>
            </div>
        </div>

        {/* PRICING PLANS (Moved Down) */}
        <PricingSection />

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

        {/* LEAD CAPTURE SYSTEM */}
        <LeadCapturePopup />

        <div className="container">
          <AdBanner position="Home-Banner" />
          
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

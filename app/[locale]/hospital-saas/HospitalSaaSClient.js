"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

export default function HospitalSaaSClient() {
  const { cartCount, toggleCart } = useCart();

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      
      <main className="flex-1" style={{ marginTop: '160px' }}>
        
        {/* HERO SECTION */}
        <div className="bg-slate-900 text-white py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_rgba(56,189,248,0.3)_0%,_transparent_70%)]" />
          <div className="container mx-auto px-8 relative z-10 text-center">
             <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                 <i className="fa-solid fa-hospital-user" /> For Hospitals & Clinics
             </div>
             <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
                 Hospital <span className="text-sky-400">SaaS</span> Platform
             </h1>
             <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto mb-10">
                 Digitize your clinic overnight. We provide white-labeled Electronic Health Records (EHR), smart inventory management, and patient portals customized for your hospital brand.
             </p>
             <button className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-sky-500/30 transition-all">
                 Request a Free Pilot
             </button>
          </div>
        </div>

        {/* Core Modules Grid */}
        <div className="container mx-auto px-8 py-20 max-w-6xl">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 
                 {/* Module 1: Smart EHR */}
                 <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                     <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-500 text-2xl mb-6">
                         <i className="fa-solid fa-laptop-medical" />
                     </div>
                     <h3 className="text-xl font-black text-slate-900 mb-3">Smart EHR</h3>
                     <p className="text-slate-500 text-sm font-medium mb-6">ABDM-compliant electronic health records. Easily generate ABHA-linked digital prescriptions and medical summaries.</p>
                     <ul className="space-y-2 text-xs font-bold text-slate-700">
                         <li><i className="fa-solid fa-check text-sky-500 mr-2" /> One-click Digital Rx</li>
                         <li><i className="fa-solid fa-check text-sky-500 mr-2" /> Voice-to-Text Dictation</li>
                         <li><i className="fa-solid fa-check text-sky-500 mr-2" /> Patient History Timeline</li>
                     </ul>
                 </div>

                 {/* Module 2: Pharmacy Inventory */}
                 <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                     <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 text-2xl mb-6">
                         <i className="fa-solid fa-boxes-stacked" />
                     </div>
                     <h3 className="text-xl font-black text-slate-900 mb-3">Pharmacy Inventory</h3>
                     <p className="text-slate-500 text-sm font-medium mb-6">Automate your in-house pharmacy. Real-time stock tracking, expiry alerts, and auto-restocking via Swastik B2B network.</p>
                     <ul className="space-y-2 text-xs font-bold text-slate-700">
                         <li><i className="fa-solid fa-check text-emerald-500 mr-2" /> Batch & Expiry Alerts</li>
                         <li><i className="fa-solid fa-check text-emerald-500 mr-2" /> Automated Procurement</li>
                         <li><i className="fa-solid fa-check text-emerald-500 mr-2" /> Low Stock Triggers</li>
                     </ul>
                 </div>

                 {/* Module 3: White-label Patient App */}
                 <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                     <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 text-2xl mb-6">
                         <i className="fa-solid fa-mobile-screen-button" />
                     </div>
                     <h3 className="text-xl font-black text-slate-900 mb-3">White-labeled App</h3>
                     <p className="text-slate-500 text-sm font-medium mb-6">Give your patients a premium digital experience with your own branded app for appointment booking and tele-consults.</p>
                     <ul className="space-y-2 text-xs font-bold text-slate-700">
                         <li><i className="fa-solid fa-check text-purple-500 mr-2" /> Custom Branding & Logo</li>
                         <li><i className="fa-solid fa-check text-purple-500 mr-2" /> Telemedicine Ready</li>
                         <li><i className="fa-solid fa-check text-purple-500 mr-2" /> Secure Payment Gateway</li>
                     </ul>
                 </div>

             </div>
        </div>

        {/* Integration Architecture */}
        <div className="bg-slate-900 py-24 text-white">
            <div className="container mx-auto px-8 max-w-4xl text-center">
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Seamless ABDM Integration</h2>
                <p className="text-slate-400 font-medium mb-12">Our SaaS modules are fully compliant with the Ayushman Bharat Digital Mission (ABDM), making your hospital eligible for government health registries instantly.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                         <div className="text-sky-400 font-black text-3xl mb-2">M1</div>
                         <div className="text-xs font-bold uppercase tracking-widest text-slate-300">ABHA Creation</div>
                     </div>
                     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                         <div className="text-emerald-400 font-black text-3xl mb-2">M2</div>
                         <div className="text-xs font-bold uppercase tracking-widest text-slate-300">Health Info Provider (HIP)</div>
                     </div>
                     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                         <div className="text-purple-400 font-black text-3xl mb-2">M3</div>
                         <div className="text-xs font-bold uppercase tracking-widest text-slate-300">Health Info User (HIU)</div>
                     </div>
                </div>
            </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}

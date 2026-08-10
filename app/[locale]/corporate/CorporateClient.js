"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CorporateClient() {
  const { cartCount, toggleCart } = useCart();

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      
      <main className="flex-1" style={{ marginTop: '160px' }}>
        
        {/* HERO SECTION */}
        <div className="bg-white py-20 border-b border-slate-200">
          <div className="container mx-auto px-8 max-w-6xl flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                    <i className="fa-solid fa-building" /> B2B Healthcare Solutions
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-6">
                    Corporate <span className="text-indigo-600">Wellness</span> Portals
                </h1>
                <p className="text-slate-500 text-lg font-medium mb-8">
                    Empower your workforce with comprehensive health benefits. Swastik Medicare offers customized wellness portals, bulk corporate discounts on medicines, and API integrations for your internal HR systems.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30 transition-all">
                        Schedule a Demo
                    </button>
                    <button className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                        Download Brochure
                    </button>
                </div>
            </div>
            <div className="flex-1 flex justify-center">
                {/* Abstract Corporate Illustration */}
                <div className="w-full max-w-md bg-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
                    
                    <div className="relative z-10 space-y-4">
                        <div className="h-4 w-1/3 bg-slate-800 rounded-full mb-8" />
                        <div className="bg-slate-800/50 p-4 rounded-2xl flex items-center gap-4 border border-slate-700">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400"><i className="fa-solid fa-chart-line" /></div>
                            <div>
                                <div className="h-2 w-24 bg-slate-700 rounded-full mb-2" />
                                <div className="h-2 w-16 bg-slate-700 rounded-full" />
                            </div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-2xl flex items-center gap-4 border border-slate-700">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400"><i className="fa-solid fa-users" /></div>
                            <div>
                                <div className="h-2 w-32 bg-slate-700 rounded-full mb-2" />
                                <div className="h-2 w-20 bg-slate-700 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <div className="container mx-auto px-8 py-20 max-w-6xl">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Why Choose Swastik Corporate?</h2>
                <p className="text-slate-500 font-medium max-w-2xl mx-auto">Reduce absenteeism and improve employee satisfaction with our integrated healthcare ecosystem.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 text-2xl mb-6">
                        <i className="fa-solid fa-percent" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-3">Bulk Corporate Discounts</h3>
                    <p className="text-slate-500 text-sm font-medium">Exclusive flat discounts on all medicines and lab tests for your entire workforce.</p>
                </div>
                
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl mb-6">
                        <i className="fa-solid fa-laptop-medical" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-3">Dedicated Employee Portal</h3>
                    <p className="text-slate-500 text-sm font-medium">A white-labeled dashboard where employees can manage their health records and subscriptions.</p>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 text-2xl mb-6">
                        <i className="fa-solid fa-code" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-3">HRMS API Integration</h3>
                    <p className="text-slate-500 text-sm font-medium">Seamlessly connect Swastik Medicare with your existing HR tools (e.g., Darwinbox, Workday).</p>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 text-2xl mb-6">
                        <i className="fa-solid fa-heart-pulse" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-3">Annual Health Checkups</h3>
                    <p className="text-slate-500 text-sm font-medium">Organize on-site or clinic-based full body checkups for all employees effortlessly.</p>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all lg:col-span-2 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-slate-900 to-indigo-900 text-white">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            Analytics
                        </div>
                        <h3 className="text-xl font-black mb-3">Aggregated Health Insights</h3>
                        <p className="text-indigo-200 text-sm font-medium mb-6">Get anonymized, aggregated data on the overall health metrics of your organization to plan better wellness initiatives.</p>
                        <button className="bg-white text-slate-900 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-slate-100">
                            View Sample Report
                        </button>
                    </div>
                    <div className="w-32 h-32 relative">
                        <i className="fa-solid fa-chart-pie text-9xl text-indigo-500/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                </div>
            </div>
            
            {/* CTA */}
            <div className="bg-slate-100 rounded-[3rem] p-12 text-center border border-slate-200">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Ready to upgrade your team's health?</h2>
                <p className="text-slate-500 font-medium max-w-lg mx-auto mb-8">Join the growing list of forward-thinking companies prioritizing employee wellness with Swastik Medicare.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <input type="email" placeholder="Enter your work email" className="px-6 py-4 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 w-full max-w-xs font-bold" />
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30 transition-all">
                        Get Started
                    </button>
                </div>
            </div>

        </div>

      </main>
      <Footer />
    </div>
  );
}

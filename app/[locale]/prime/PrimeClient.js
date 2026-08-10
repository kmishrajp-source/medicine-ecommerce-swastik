"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function PrimeClient() {
  const { cartCount, toggleCart } = useCart();

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      
      <main className="flex-1" style={{ marginTop: '160px' }}>
        
        {/* HERO SECTION */}
        <div className="bg-slate-900 py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_rgba(250,204,21,0.3)_0%,_transparent_70%)]" />
          <div className="container mx-auto px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                <i className="fa-solid fa-crown" /> The Ultimate Healthcare Membership
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6">
              Swastik <span className="text-yellow-500">Prime</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto mb-10">
              Unlimited free deliveries, flat 20% off on all medicines, and priority 24/7 tele-consultations for you and your family.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <button className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-900 px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-yellow-500/20 transition-all">
                  Join Prime at ₹999/yr
               </button>
               <span className="text-slate-500 text-xs font-bold">Cancel anytime. 30-day money back guarantee.</span>
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <div className="container mx-auto px-8 py-20 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center hover:shadow-xl transition-all group">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-truck-fast" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">Unlimited Free Delivery</h3>
                    <p className="text-slate-500 text-sm font-medium">No minimum order value. Get your medicines delivered free, even for a single strip.</p>
                </div>
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center hover:shadow-xl transition-all group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500" />
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-tags" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">Flat 20% Extra Off</h3>
                    <p className="text-slate-500 text-sm font-medium">Enjoy a flat 20% discount on all prescription medicines, on top of existing offers.</p>
                </div>
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center hover:shadow-xl transition-all group">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-stethoscope" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">Priority Tele-Consults</h3>
                    <p className="text-slate-500 text-sm font-medium">Skip the queue. Get connected to our specialist doctors within 60 seconds, 24/7.</p>
                </div>
            </div>

            {/* PRICING PLANS */}
            <div className="text-center mb-12">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Choose Your Plan</h2>
                <p className="text-slate-500 font-medium max-w-xl mx-auto">Select a subscription that fits your healthcare needs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Basic Plan */}
                <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm">
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Prime Individual</h3>
                    <p className="text-sm text-slate-500 mb-6">Perfect for single users managing chronic care.</p>
                    <div className="text-5xl font-black text-slate-900 mb-8">₹999<span className="text-lg text-slate-400 font-bold">/yr</span></div>
                    
                    <ul className="space-y-4 mb-10">
                        <li className="flex items-center gap-3 text-sm font-bold text-slate-700">
                            <i className="fa-solid fa-check text-emerald-500" /> Free Delivery (No minimums)
                        </li>
                        <li className="flex items-center gap-3 text-sm font-bold text-slate-700">
                            <i className="fa-solid fa-check text-emerald-500" /> Flat 20% off Medicines
                        </li>
                        <li className="flex items-center gap-3 text-sm font-bold text-slate-700">
                            <i className="fa-solid fa-check text-emerald-500" /> 1 Free Lab Test per year
                        </li>
                        <li className="flex items-center gap-3 text-sm font-bold text-slate-700">
                            <i className="fa-solid fa-check text-emerald-500" /> 1 Profile
                        </li>
                    </ul>

                    <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                        Select Plan
                    </button>
                </div>

                {/* Family Plan */}
                <div className="bg-slate-900 rounded-3xl p-10 border border-slate-800 shadow-2xl relative overflow-hidden transform md:-translate-y-4">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl" />
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Most Popular</div>
                    
                    <h3 className="text-2xl font-black text-white mb-2">Prime Family</h3>
                    <p className="text-sm text-slate-400 mb-6">Complete health coverage for the whole family.</p>
                    <div className="text-5xl font-black text-white mb-8">₹1,999<span className="text-lg text-slate-500 font-bold">/yr</span></div>
                    
                    <ul className="space-y-4 mb-10">
                        <li className="flex items-center gap-3 text-sm font-bold text-slate-300">
                            <i className="fa-solid fa-check text-yellow-500" /> Free Delivery (No minimums)
                        </li>
                        <li className="flex items-center gap-3 text-sm font-bold text-slate-300">
                            <i className="fa-solid fa-check text-yellow-500" /> Flat 25% off Medicines
                        </li>
                        <li className="flex items-center gap-3 text-sm font-bold text-slate-300">
                            <i className="fa-solid fa-check text-yellow-500" /> 4 Free Lab Tests per year
                        </li>
                        <li className="flex items-center gap-3 text-sm font-bold text-slate-300">
                            <i className="fa-solid fa-check text-yellow-500" /> Up to 6 Family Profiles
                        </li>
                        <li className="flex items-center gap-3 text-sm font-bold text-slate-300">
                            <i className="fa-solid fa-check text-yellow-500" /> Priority Ambulance Booking
                        </li>
                    </ul>

                    <button className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-900 py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-yellow-500/20 transition-all">
                        Select Family Plan
                    </button>
                </div>
            </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}

"use client";
import LinkedIn from "next/image";
import { Link } from "@/i18n/navigation";
import { useState } from "react";
import WhatsAppLeadForm from "@/components/WhatsAppLeadForm";

export default function MarketingHelpPage() {
    const [showWAForm, setShowWAForm] = useState(false);

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-emerald-500 selection:text-white">
            <WhatsAppLeadForm 
                isOpen={showWAForm} 
                onClose={() => setShowWAForm(false)}
                targetName="Emergency Medical Support"
                targetType="emergency"
                targetPhone="7992122974"
            />

            {/* Ultra-Fast Header */}
            <nav className="p-6 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black">S</div>
                    <span className="font-black uppercase tracking-widest text-xs">Swastik Medicare</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                    <i className="fa-solid fa-circle text-[6px] animate-pulse"></i> Live in Gorakhpur
                </div>
            </nav>

            <main className="px-6 py-20 max-w-2xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-block bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-8">
                        <i className="fa-solid fa-shield-heart mr-2"></i> Official Healthcare Support
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] mb-8">
                        Need <span className="text-emerald-500">Medical</span> Help <br/> Right Now?
                    </h1>
                    <p className="text-slate-400 font-bold text-lg mb-12 leading-relaxed">
                        Don't wait in lines. Connect with the best doctors and pharmacies in Gorakhpur instantly via WhatsApp.
                    </p>

                    <div className="space-y-4">
                        <button 
                            onClick={() => setShowWAForm(true)}
                            className="w-full bg-emerald-500 text-white font-black py-8 rounded-3xl text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <i className="fa-brands fa-whatsapp text-2xl"></i> Start WhatsApp Consultation
                        </button>
                        <a 
                            href="tel:917992122974"
                            className="w-full bg-white/5 border border-white/10 text-white font-black py-6 rounded-3xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                        >
                            <i className="fa-solid fa-phone"></i> Emergency Call
                        </a>
                    </div>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-2 gap-4 mb-20">
                    <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10">
                        <div className="text-emerald-500 text-2xl mb-4"><i className="fa-solid fa-user-doctor"></i></div>
                        <h4 className="font-black text-xs uppercase tracking-widest mb-2">Verified Doctors</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">200+ Specialists ready to help.</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10">
                        <div className="text-emerald-500 text-2xl mb-4"><i className="fa-solid fa-truck-fast"></i></div>
                        <h4 className="font-black text-xs uppercase tracking-widest mb-2">Home Delivery</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Medicines delivered in 30 mins.</p>
                    </div>
                </div>

                {/* Social Proof */}
                <div className="text-center bg-white/5 p-10 rounded-[3rem] border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px]"></div>
                    <h3 className="text-3xl font-black mb-2 tracking-tighter uppercase italic">"The fastest way to find a doctor in Gorakhpur"</h3>
                    <div className="flex justify-center gap-1 text-emerald-500 text-xs mb-4">
                        <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                    </div>
                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">— Verified Patient from Golghar</p>
                </div>

                {/* Footer Minimal */}
                <footer className="mt-32 text-center">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.5em] mb-8">Swastik Medicare • Mission Gorakhpur</p>
                    <Link href="/" className="text-emerald-500 font-black text-[10px] uppercase tracking-widest hover:underline">
                        Visit Main Website
                    </Link>
                </footer>
            </main>
        </div>
    );
}

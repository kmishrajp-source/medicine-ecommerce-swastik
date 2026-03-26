"use client";
import React from 'react';
import { Link } from '@/i18n/navigation';

export default function MiniHeader() {
    return (
        <div className="bg-[#f8fafc] border-b border-slate-200 py-2 px-6 hidden md:block overflow-hidden relative">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex gap-8 items-center">
                    <Link href="/doctors" className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-600 transition-all">
                        <i className="fa-solid fa-phone-volume text-indigo-500"></i>
                        Phone Consult <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[9px]">24x7</span>
                    </Link>
                    <Link href="/my-health-records" className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-emerald-600 transition-all">
                        <i className="fa-solid fa-file-medical text-emerald-500"></i>
                        Personal Health Account (PHR)
                    </Link>
                </div>
                <div className="flex gap-6 items-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-4">
                        <span className="flex items-center gap-1"><i className="fa-solid fa-truck-fast text-indigo-500"></i> Free Delivery on orders above ₹500</span>
                        <span className="text-slate-200">|</span>
                        <span><i className="fa-solid fa-bullhorn text-indigo-300 mr-2"></i> PROMO: ₹0 Activation fee for new Doctors till April</span>
                    </div>
                    <Link href="/partner" className="text-[11px] font-black text-slate-900 hover:text-indigo-600 transition-all uppercase tracking-widest flex items-center gap-2">
                        For Providers <i className="fa-solid fa-caret-down text-[10px]"></i>
                    </Link>
                </div>
            </div>
            {/* Subtle Gradient Polish */}
            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-indigo-50/30 to-transparent pointer-events-none"></div>
        </div>
    );
}

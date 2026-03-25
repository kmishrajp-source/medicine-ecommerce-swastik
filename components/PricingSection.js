"use client";
import { useTranslations } from 'next-intl';

export default function PricingSection() {
    const t = useTranslations('Conversion');
    
    return (
        <div className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">{t('pricing_title')}</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Simple Plans for Massive Growth</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
                    {/* Basic Plan */}
                    <div className="bg-slate-50 p-10 rounded-[50px] border-2 border-slate-100 flex flex-col items-center text-center">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">Standard Entry</span>
                        <h3 className="text-3xl font-black text-slate-900 mb-2">{t('basic_plan')}</h3>
                        <div className="text-5xl font-black text-slate-900 tracking-tighter mb-6">₹299<span className="text-sm font-bold text-slate-400">/mo</span></div>
                        <ul className="space-y-4 mb-10 text-left w-full">
                            <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                <i className="fa-solid fa-check text-emerald-500"></i> Local Directory Listing
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                <i className="fa-solid fa-check text-emerald-500"></i> One-Click Call Button
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                <i className="fa-solid fa-check text-emerald-500"></i> WhatsApp Lead System
                            </li>
                        </ul>
                        <button className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors">Select Basic</button>
                    </div>

                    {/* Featured Plan */}
                    <div className="bg-slate-900 p-10 rounded-[50px] border-[6px] border-indigo-500/20 flex flex-col items-center text-center relative overflow-hidden scale-105 shadow-2xl">
                        <div className="absolute top-6 right-6 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Popular</div>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Maximum Coverage</span>
                        <h3 className="text-3xl font-black text-white mb-2">{t('featured_plan')}</h3>
                        <div className="text-5xl font-black text-white tracking-tighter mb-6">₹999<span className="text-sm font-bold text-slate-500">/mo</span></div>
                        <ul className="space-y-4 mb-10 text-left w-full">
                            <li className="flex items-center gap-3 text-sm font-bold text-slate-300">
                                <i className="fa-solid fa-check text-indigo-400"></i> Everything in Basic
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold text-slate-300">
                                <i className="fa-solid fa-star text-amber-400"></i> Priority "Featured" Ranking
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold text-slate-300">
                                <i className="fa-solid fa-chart-line text-indigo-400"></i> Performance Analytics
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold text-slate-300">
                                <i className="fa-solid fa-bullhorn text-indigo-400"></i> Cross-Platform Promotion
                            </li>
                        </ul>
                        <button className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">Go Featured</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

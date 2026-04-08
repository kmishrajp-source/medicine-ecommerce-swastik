"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function MarketingAdminPage() {
    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState({ total: 0, facebook: 0, whatsapp_clicks: 0 });
    const [utmBuilder, setUtmBuilder] = useState({
        baseUrl: "https://swastikmedicare.in/marketing/help",
        source: "fb_ads",
        campaign: "gorakhpur_emergency",
        medium: "mobile_feed"
    });

    // Generate the tracking URL
    const generatedUrl = `${utmBuilder.baseUrl}?utm_source=${utmBuilder.source}&utm_campaign=${utmBuilder.campaign}&utm_medium=${utmBuilder.medium}`;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-8 pt-44 pb-24">
                <div className="mb-12">
                    <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">Marketing Console</span>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-2">Ad Performance <span className="text-blue-600">Command Center</span></h1>
                    <p className="text-slate-400 font-bold">Track ROI and generate campaign links for Facebook, Instagram, and YouTube.</p>
                </div>

                {/* ROI Snapshots */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col justify-between">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-xl mb-6 shadow-inner">
                            <i className="fa-solid fa-bullseye"></i>
                        </div>
                        <div>
                            <div className="text-4xl font-black text-slate-900 mb-1">54</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Add Leads (24h)</div>
                        </div>
                    </div>
                    <div className="bg-slate-900 p-10 rounded-[3rem] shadow-xl text-white flex flex-col justify-between">
                        <div className="w-12 h-12 bg-white/10 text-emerald-400 rounded-2xl flex items-center justify-center text-xl mb-6 shadow-inner">
                            <i className="fa-brands fa-whatsapp"></i>
                        </div>
                        <div>
                            <div className="text-4xl font-black text-white mb-1">82%</div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-normal">Conversion Rate <br/> (Ad Click to WA)</div>
                        </div>
                    </div>
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col justify-between">
                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-xl mb-6 shadow-inner">
                            <i className="fa-solid fa-indian-rupee-sign"></i>
                        </div>
                        <div>
                            <div className="text-4xl font-black text-slate-900 mb-1">₹4.2</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cost Per Lead (Est.)</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Link Generator */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-blue-100">
                            <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight flex items-center gap-3">
                                <i className="fa-solid fa-link text-blue-600"></i> Ad Link Generator
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Ad Source (FB/IG/YT)</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-xl font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                                        value={utmBuilder.source}
                                        onChange={(e) => setUtmBuilder({...utmBuilder, source: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Campaign Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-xl font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                                        value={utmBuilder.campaign}
                                        onChange={(e) => setUtmBuilder({...utmBuilder, campaign: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-100 break-all transition-all group">
                                <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex justify-between">
                                    Final Campaign URL
                                    <button onClick={() => navigator.clipboard.writeText(generatedUrl)} className="hover:text-slate-900">
                                        <i className="fa-solid fa-copy"></i> Copy
                                    </button>
                                </div>
                                <code className="text-[10px] font-bold text-slate-500">{generatedUrl}</code>
                            </div>
                        </div>

                        {/* Module 2: Ad Copy Templates */}
                        <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl">
                            <h3 className="text-lg font-black mb-8 uppercase tracking-tight text-emerald-400">🔥 Ad Copy Templates</h3>
                            <div className="space-y-6">
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                    <p className="text-[10px] font-bold text-slate-400 italic mb-2">Facebook Ads Template:</p>
                                    <p className="text-xs font-bold leading-relaxed">
                                        "💊 Need medicine at home in Gorakhpur? Or finding a doctor? Swastik Medicare connects you instantly via WhatsApp. Zero friction, 100% verified. Tap below! 👇"
                                    </p>
                                </div>
                                <button className="w-full bg-white/5 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all">
                                    Copy Script
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* LIVE LEAD FEED */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
                            <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recent Ad Conversions</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Feed</span>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {[
                                    { name: "Rahul Singh", loc: "Golghar", prob: "Consultation", src: "fb_ads", time: "2 mins ago" },
                                    { name: "Suman Tiwari", loc: "Basharatpur", prob: "Medicine Home Delivery", src: "ig_stories", time: "15 mins ago" },
                                    { name: "Amit Verma", loc: "Shahpur", prob: "Ambulance Emergency", src: "google_search", time: "1 hour ago" }
                                ].map((lead, i) => (
                                    <div key={i} className="p-8 hover:bg-slate-50 transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                {lead.name[0]}
                                            </div>
                                            <div>
                                                <h5 className="font-black text-slate-900 uppercase tracking-tight">{lead.name}</h5>
                                                <p className="text-xs font-bold text-slate-400 italic">{lead.prob} • {lead.loc}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest mb-1">{lead.src}</span>
                                            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{lead.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-8 bg-slate-50 text-center">
                                <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                                    View Full Lead Database <i className="fa-solid fa-arrow-right ml-2"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

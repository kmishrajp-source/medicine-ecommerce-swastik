"use client";
import React from 'react';
import Image from 'next/image';

export default function GenericRetailerCard({ retailer }) {
    const handleBuyWhatsApp = () => {
        // Platform Mediator Logic: Send the customer DIRECTLY to the Generic Retailer
        const message = `Hello ${retailer.shopName}, I found your Generic Medicine Store via the Swastik Medicare Directory. I would like to buy generic medicines from your store.`;
        // Ensure phone number starts with 91 for WhatsApp in India
        let phone = retailer.phone;
        if (!phone.startsWith('91')) phone = `91${phone}`;
        
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
    };

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-emerald-100 hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col h-full">
            {/* Top Badge Overlay */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

            <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shadow-sm border border-emerald-100">
                    <i className="fa-solid fa-leaf"></i>
                </div>
                <div className="flex items-center gap-1 bg-emerald-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                    <i className="fa-solid fa-check-double"></i> Verified Generic Store
                </div>
            </div>

            <div className="flex-1">
                <h3 className="text-xl font-black text-slate-900 mb-1 leading-tight group-hover:text-emerald-700 transition-colors">{retailer.shopName}</h3>
                
                <div className="flex items-center gap-2 mb-4">
                    <p className="text-xs font-bold text-slate-500 line-clamp-1">{retailer.city}</p>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                        PMBJP Kendra
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex flex-col">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Rating</span>
                        <span className="text-[10px] font-black text-amber-500 flex items-center gap-0.5">
                            <i className="fa-solid fa-star text-[8px]"></i> {retailer.rating || '4.5'}
                        </span>
                    </div>
                    <div className="flex flex-col border-l border-slate-200 pl-2">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Hours</span>
                        <span className="text-[10px] font-black text-emerald-600">
                            {retailer.openingHours || '9 AM - 9 PM'}
                        </span>
                    </div>
                </div>

                <div className="space-y-2.5 mb-8 text-sm">
                    <div className="flex items-start gap-3">
                        <i className="fa-solid fa-location-dot text-slate-400 w-3 mt-1"></i>
                        <span className="text-slate-600 font-medium text-xs leading-relaxed line-clamp-2">{retailer.address}</span>
                    </div>
                </div>
            </div>

            {/* Mediator Buy Button */}
            <button 
                onClick={handleBuyWhatsApp}
                className="w-full bg-emerald-600 text-white text-center font-black py-4 rounded-xl text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-200 group"
            >
                <i className="fa-brands fa-whatsapp text-lg group-hover:scale-110 transition-transform"></i> 
                Buy Generic Medicines
            </button>
            <p className="text-center text-[9px] text-slate-400 font-medium mt-3">
                * Order directly from the store via Swastik Mediator
            </p>
        </div>
    );
}

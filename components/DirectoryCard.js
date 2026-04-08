"use client";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { maskPhone } from "@/lib/security";
import VerifiedBadge from "./VerifiedBadge";
import Image from "next/image";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics";
import WhatsAppLeadForm from "./WhatsAppLeadForm";

export default function DirectoryCard({ item, type, onBook }) {
    const { data: session } = useSession();
    const [showWAForm, setShowWAForm] = useState(false);
    
    const [isUnlocked, setIsUnlocked] = useState(item?.isUnlocked || false);
    
    // ... (rest of logic remains same)

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col h-full">
            <WhatsAppLeadForm 
                isOpen={showWAForm} 
                onClose={() => setShowWAForm(false)}
                targetName={displayName}
                targetType={type}
                targetPhone={item.phone}
            />
            {/* Top Badge Overlay */}
            {/* ... rest of the component until the WhatsApp link ... */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        setShowWAForm(true);
                    }}
                    className="bg-emerald-50 text-emerald-600 text-center font-black py-4 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition-all active:scale-95 border border-emerald-100"
                >
                    <i className="fa-brands fa-whatsapp text-sm"></i> WhatsApp
                </button>
                <a 
                    href={`tel:${item.phone}`}
                    onClick={() => trackEvent(ANALYTICS_EVENTS.CONTACT, { method: "call", target: displayName, type: type })}
                    className="bg-slate-50 text-slate-900 text-center font-black py-4 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
                >
                    <i className="fa-solid fa-phone text-[10px]"></i> Call Now
                </a>
                <button 
                    onClick={() => {
                        trackEvent(ANALYTICS_EVENTS.LEAD, { target: displayName, type: type });
                        onBook(item);
                    }} 
                    className="col-span-2 bg-indigo-600 text-white text-center font-black py-4 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100 group"
                >
                    <i className="fa-solid fa-calendar-check text-sm group-hover:rotate-12 transition-transform"></i> 
                    {type === 'retailer' ? 'Order via Direct Message' : (type === 'ambulance' ? 'Request Emergency Pick' : 'Request Instant Callback')}
                </button>
            </div>

            {/* Module 6: Trust & Verification Reporting */}
            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                 <a 
                    href={`https://wa.me/917992122974?text=Report Incorrect Info: ${displayName} (${type}) ID: ${item.id}`}
                    className="text-[8px] font-black text-slate-300 uppercase tracking-widest hover:text-rose-400 transition-colors flex items-center gap-1"
                 >
                    <i className="fa-solid fa-triangle-exclamation"></i> Report Incorrect Info
                 </a>
                 <div className="text-[8px] font-black text-slate-200 uppercase tracking-widest">
                    ID: {item.id.slice(-6)}
                 </div>
            </div>
        </div>
    );
}

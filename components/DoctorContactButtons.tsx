"use client";
import { useState } from "react";
import WhatsAppLeadForm from "./WhatsAppLeadForm";

export default function DoctorContactButtons({ doctor }) {
    const [showWAForm, setShowWAForm] = useState(false);

    return (
        <>
            <WhatsAppLeadForm 
                isOpen={showWAForm} 
                onClose={() => setShowWAForm(false)}
                targetName={doctor.name}
                targetType="doctor"
                targetPhone={doctor.phone}
            />
            
            <div className="mt-12 flex flex-col md:flex-row gap-6">
                <a 
                    href={`tel:${doctor.phone || '9161364908'}`}
                    className="flex-1 bg-slate-900 text-white font-black py-6 rounded-[2rem] text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-200"
                >
                    <i className="fa-solid fa-phone-volume"></i> Call Doctor Now
                </a>
                <button 
                    onClick={() => setShowWAForm(true)}
                    className="flex-1 bg-emerald-500 text-white font-black py-6 rounded-[2rem] text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200"
                >
                    <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp
                </button>
            </div>
        </>
    );
}

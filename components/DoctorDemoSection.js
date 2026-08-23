"use client";
import React, { useState } from 'react';
import { Link } from '@/i18n/navigation';

export default function DoctorDemoSection() {
    const [activeStep, setActiveStep] = useState(1);

    const steps = [
        {
            id: 1,
            titleEn: "1. Select Doctor & Book Slot",
            titleHi: "1. डॉक्टर चुनें और समय बुक करें",
            icon: "fa-user-doctor",
            color: "#4f46e5",
            bg: "#e0e7ff",
            descEn: "Search top specialized doctors near you, check fees & available times, and book a video consultation in seconds.",
            descHi: "अपने नजदीकी विशेषज्ञ डॉक्टरों की सूची देखें, फीस और समय जांचें और सेकंडों में ऑनलाइन अपॉइंटमेंट बुक करें।",
            previewBadge: "Step 1: Booking Confirmed / अपॉइंटमेंट कन्फर्म",
            previewContent: (
                <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-lg text-left space-y-3">
                    <div className="flex items-center gap-3 border-b pb-3">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold">
                            👩‍⚕️
                        </div>
                        <div>
                            <h4 className="font-black text-slate-800 text-sm">Dr. Anita Sharma (MD)</h4>
                            <p className="text-xs text-indigo-600 font-bold">General Physician • 12 Yrs Exp</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                        <span><i className="fa-regular fa-clock text-indigo-500 mr-1"></i> Today, 11:00 AM</span>
                        <span className="font-bold text-emerald-600">Fee: ₹300 (Paid)</span>
                    </div>
                    <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl text-[11px] font-bold flex items-center gap-2">
                        <i className="fa-brands fa-whatsapp text-emerald-600 text-sm"></i>
                        <span>WhatsApp booking alert & Google Meet link sent! / मैसेज भेज दिया गया!</span>
                    </div>
                </div>
            )
        },
        {
            id: 2,
            titleEn: "2. Online Video Consultation",
            titleHi: "2. ऑनलाइन वीडियो परामर्श (डॉक्टर कॉल)",
            icon: "fa-video",
            color: "#0891b2",
            bg: "#cffaff",
            descEn: "Connect via secure high-definition video call from the comfort of your home. Share symptoms with the doctor.",
            descHi: "अपने घर बैठे ही सुरक्षित एचडी वीडियो कॉल द्वारा डॉक्टर से जुड़ें और अपनी बीमारी व लक्षण बताएं।",
            previewBadge: "Step 2: Live Video Call / लाइव कंसल्टेशन",
            previewContent: (
                <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl text-left space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Call in Progress
                        </span>
                        <span className="text-[10px] bg-white/10 px-2 py-1 rounded">08:42 Min</span>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                        <p className="text-xs font-bold text-slate-300">Chief Symptoms / लक्षण:</p>
                        <p className="text-xs text-indigo-200 mt-1">Fever (101°F), Sore Throat, and Cough since 2 days.</p>
                    </div>
                    <div className="flex justify-center gap-4 pt-1">
                        <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs"><i className="fa-solid fa-microphone"></i></div>
                        <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-xs"><i className="fa-solid fa-phone-slash"></i></div>
                        <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs"><i className="fa-solid fa-video"></i></div>
                    </div>
                </div>
            )
        },
        {
            id: 3,
            titleEn: "3. Digital Rx Issued",
            titleHi: "3. डिजिटल पर्चा (Digital Prescription)",
            icon: "fa-file-prescription",
            color: "#7c3aed",
            bg: "#f3e8ff",
            descEn: "Doctor writes prescribed medicines & exact dosages digitally. Prescription is instantly generated & saved.",
            descHi: "परामर्श के तुरंत बाद डॉक्टर डिजिटल पर्चा तैयार करते हैं जिसमें दवाई और खुराक की सही जानकारी होती है।",
            previewBadge: "Step 3: Digital Prescription / डॉक्टर का पर्चा",
            previewContent: (
                <div className="bg-white p-5 rounded-2xl border-2 border-purple-200 shadow-lg text-left space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-xs font-black text-purple-700">Rx ID: #SW-99824</span>
                        <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">Signed & Verified</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-700 font-bold">
                        <div className="flex justify-between bg-purple-50 p-2 rounded">
                            <span>1. Azithromycin 500mg</span>
                            <span className="text-purple-600">1 Tab/Day (3 Days)</span>
                        </div>
                        <div className="flex justify-between bg-purple-50 p-2 rounded">
                            <span>2. Dolo 650mg</span>
                            <span className="text-purple-600">3 Times/Day (5 Days)</span>
                        </div>
                        <div className="flex justify-between bg-purple-50 p-2 rounded">
                            <span>3. Alex Cough Syrup</span>
                            <span className="text-purple-600">2 tsp twice daily</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 4,
            titleEn: "4. Doorstep Medicine Delivery",
            titleHi: "4. घर तक 10-मिनट में दवाई डिलीवरी",
            icon: "fa-motorcycle",
            color: "#059669",
            bg: "#d1fae5",
            descEn: "Digital Rx connects to local PMBJP kendra / pharmacy. Swastik rider dispatches medicines to your door in 10-15 mins!",
            descHi: "डिजिटल पर्चा सीधे नजदीकी जन औषधि केंद्र से जुड़ता है और स्वास्तिक राइडर दवाई 10-15 मिनट में आपके घर पहुंचाता है!",
            previewBadge: "Step 4: Out for Delivery / डिलीवरी जारी",
            previewContent: (
                <div className="bg-emerald-900 text-white p-5 rounded-2xl shadow-xl text-left space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl">
                            <i className="fa-solid fa-motorcycle"></i>
                        </div>
                        <div>
                            <h4 className="font-black text-sm text-white">Rider On The Way / राइडर रास्ते में है</h4>
                            <p className="text-xs text-emerald-300 font-bold">Arriving in ~12 Minutes</p>
                        </div>
                    </div>
                    <div className="bg-emerald-800/80 p-3 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between text-emerald-200">
                            <span>Pickup Store:</span>
                            <span className="font-bold text-white">PMBJP Jan Aushadhi Kendra</span>
                        </div>
                        <div className="flex justify-between text-emerald-200">
                            <span>Cash to Pay (COD):</span>
                            <span className="font-bold text-amber-300">₹140 (Save 75%)</span>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const currentStep = steps.find(s => s.id === activeStep) || steps[0];

    return (
        <section className="py-20 bg-slate-900 text-white relative overflow-hidden my-16">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">
                        <i className="fa-solid fa-circle-play mr-2 text-indigo-400"></i> Interactive Demo / लाइव प्रदर्शन
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                        How Doctor Consultation & Digital Prescription Works
                    </h2>
                    <p className="text-lg text-slate-400 font-medium leading-relaxed">
                        डॉक्टर की सलाह से लेकर 10-मिनट में घर तक दवाई पाने की पूरी प्रक्रिया समझें
                    </p>
                </div>

                {/* Step Selector Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {steps.map((step) => {
                        const isActive = step.id === activeStep;
                        return (
                            <button
                                key={step.id}
                                onClick={() => setActiveStep(step.id)}
                                className={`p-5 rounded-2xl text-left transition-all border flex flex-col justify-between ${
                                    isActive
                                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-xl shadow-indigo-600/30 scale-[1.02]'
                                        : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                                }`}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
                                        isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                                    }`}>
                                        <i className={`fa-solid ${step.icon}`}></i>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                        isActive ? 'bg-white text-indigo-700' : 'bg-slate-700 text-slate-400'
                                    }`}>
                                        Step {step.id}
                                    </span>
                                </div>

                                <div>
                                    <h4 className="font-black text-sm mb-1 leading-snug">{step.titleEn}</h4>
                                    <p className="text-xs opacity-90 font-medium text-slate-300">{step.titleHi}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Interactive Preview Container */}
                <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-12">
                    {/* Left: Text Explanation */}
                    <div className="flex-1 text-left space-y-6">
                        <div className="inline-block bg-indigo-500/20 text-indigo-300 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                            {currentStep.previewBadge}
                        </div>
                        
                        <h3 className="text-2xl md:text-3xl font-black leading-tight text-white">
                            {currentStep.titleEn}
                        </h3>
                        <h4 className="text-xl font-bold text-indigo-300 leading-snug">
                            {currentStep.titleHi}
                        </h4>

                        <div className="space-y-3 text-slate-300 text-sm leading-relaxed font-medium bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
                            <p><strong className="text-white">English:</strong> {currentStep.descEn}</p>
                            <p className="border-t border-slate-800 pt-2 text-indigo-200"><strong className="text-white">हिंदी:</strong> {currentStep.descHi}</p>
                        </div>

                        <div className="pt-2 flex flex-wrap items-center gap-4">
                            <Link 
                                href="/doctors" 
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-4 rounded-full text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                            >
                                Book Doctor Consultation Now / अभी अपॉइंटमेंट लें <i className="fa-solid fa-arrow-right"></i>
                            </Link>
                        </div>
                    </div>

                    {/* Right: Live Interactive Card Preview */}
                    <div className="w-full md:w-[420px] shrink-0">
                        <div className="bg-gradient-to-b from-slate-700 to-slate-900 p-4 rounded-[2.5rem] border-4 border-slate-600 shadow-2xl relative">
                            {/* Camera Notch */}
                            <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto mb-4"></div>
                            
                            {/* Card Content */}
                            {currentStep.previewContent}

                            <div className="mt-4 text-center">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    <i className="fa-solid fa-shield-halved text-emerald-400 mr-1"></i> 100% Verified & Telemedicine Compliant
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

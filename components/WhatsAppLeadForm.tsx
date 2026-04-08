"use client";
import { useState } from "react";
import { trackAdLead } from "@/lib/analytics";

export default function WhatsAppLeadForm({ isOpen, onClose, targetName, targetType, targetPhone }) {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        problem: "",
        location: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // 1. Log Lead to Database & Meta Pixel
        await trackAdLead({
            ...formData,
            serviceType: targetType,
            targetProvider: targetName
        });

        // 2. Redirect to WhatsApp with pre-filled message
        const waMessage = `Hello, I found ${targetName} on Swastik Medicare. %0A%0AMy Name: ${formData.name}%0ALocation: ${formData.location}%0AProblem: ${formData.problem}`;
        const waUrl = `https://wa.me/91${targetPhone.replace(/[^0-9]/g, '')}?text=${waMessage}`;
        
        window.open(waUrl, "_blank");
        onClose();
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/60 transition-all duration-500 animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-slate-900 p-10 text-center relative">
                    <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                    <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-xl shadow-emerald-500/20">
                        <i className="fa-brands fa-whatsapp"></i>
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Connect Instantly</h3>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest italic">Fastest medical support in Gorakhpur</p>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Your Full Name</label>
                            <input 
                                required
                                type="text"
                                placeholder="e.g. Rahul Kumar"
                                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold text-slate-900 focus:border-emerald-500 transition-all outline-none"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Mobile number</label>
                                <input 
                                    required
                                    type="tel"
                                    placeholder="10-digit number"
                                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold text-slate-900 focus:border-emerald-500 transition-all outline-none"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Your Location</label>
                                <input 
                                    required
                                    type="text"
                                    placeholder="e.g. Golghar"
                                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold text-slate-900 focus:border-emerald-500 transition-all outline-none"
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">How can we help you?</label>
                            <textarea 
                                required
                                rows={3}
                                placeholder="Describe your medical problem or requirement..."
                                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold text-slate-900 focus:border-emerald-500 transition-all outline-none resize-none"
                                value={formData.problem}
                                onChange={(e) => setFormData({...formData, problem: e.target.value})}
                            />
                        </div>
                    </div>

                    <button 
                        disabled={isSubmitting}
                        className="w-full bg-emerald-500 text-white font-black py-6 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                    >
                        {isSubmitting ? (
                            <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                            <>
                                <i className="fa-brands fa-whatsapp text-lg"></i> Start WhatsApp Consultation
                            </>
                        )}
                    </button>
                    <p className="text-center text-[8px] font-black text-slate-300 uppercase tracking-widest">
                        <i className="fa-solid fa-shield-halved mr-1"></i> Your data is 100% secure & HIPAA Compliant
                    </p>
                </form>
            </div>
        </div>
    );
}

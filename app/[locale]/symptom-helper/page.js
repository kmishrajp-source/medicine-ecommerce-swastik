"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { Link } from "@/i18n/navigation";

const symptomToSpecialist = {
    "fever": "General Physician",
    "cold": "General Physician",
    "cough": "General Physician",
    "headache": "General Physician",
    "stomach pain": "General Physician",
    "chest pain": "Cardiologist",
    "palpitations": "Cardiologist",
    "shortness of breath": "Cardiologist",
    "skin rash": "Dermatologist",
    "acne": "Dermatologist",
    "itching": "Dermatologist",
    "hair loss": "Dermatologist",
    "child fever": "Pediatrician",
    "vaccination": "Pediatrician",
    "baby growth": "Pediatrician",
    "pregnancy": "Gynecologist",
    "periods": "Gynecologist",
    "women's health": "Gynecologist",
    "pcos": "Gynecologist",
    "back pain": "Orthopedic",
    "joint pain": "Orthopedic",
    "fracture": "Orthopedic",
    "toothache": "Dentist",
    "cavity": "Dentist",
    "gum bleed": "Dentist",
    "blurry vision": "Ophthalmologist",
    "eye pain": "Ophthalmologist",
    "hearing loss": "ENT Specialist",
    "ear pain": "ENT Specialist",
    "sore throat": "ENT Specialist"
};

export default function SymptomHelperPage() {
    const { cartCount, toggleCart } = useCart();
    const [symptom, setSymptom] = useState("");
    const [suggestion, setSuggestion] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        const input = symptom.toLowerCase().trim();
        
        let foundMatch = null;
        for (const key in symptomToSpecialist) {
            if (input.includes(key)) {
                foundMatch = symptomToSpecialist[key];
                break;
            }
        }

        if (foundMatch) {
            setSuggestion(foundMatch);
        } else {
            setSuggestion("General Physician"); // Default
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
                <div className="text-center mb-16">
                    <div className="inline-block bg-blue-100 text-blue-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-6 shadow-sm">
                        AI Symptom Helper
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
                        Not sure which <span className="text-blue-600">doctor to visit?</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
                        Tell us your symptoms and we'll suggest the right specialist for you instantly.
                    </p>
                </div>

                <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-slate-200 border border-slate-100 mb-16">
                    <form onSubmit={handleSearch} className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">What are you experiencing?</label>
                            <input 
                                type="text" 
                                value={symptom}
                                onChange={(e) => setSymptom(e.target.value)}
                                placeholder="e.g. Mild fever, chest pain, back ache..."
                                className="w-full p-8 rounded-[2rem] bg-slate-50 border-none text-xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 placeholder:text-slate-300 transition-all"
                                required
                            />
                        </div>
                        <button 
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2rem] text-sm uppercase tracking-widest shadow-xl shadow-blue-200 transition-all active:scale-[0.98]"
                        >
                            Analyze Symptom <i className="fa-solid fa-wand-sparkles ml-2"></i>
                        </button>
                    </form>

                    {suggestion && (
                        <div className="mt-16 pt-16 border-t border-slate-50 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-4">Recommended Specialist</p>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8">{suggestion}</h2>
                            <div className="flex flex-col md:flex-row gap-4 justify-center">
                                <Link 
                                    href={`/doctors?specialization=${encodeURIComponent(suggestion)}`}
                                    className="bg-slate-900 text-white font-black px-10 py-5 rounded-2xl hover:bg-black transition-all shadow-lg text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    Find {suggestion}s near me <i className="fa-solid fa-arrow-right"></i>
                                </Link>
                                <button 
                                    onClick={() => setSuggestion(null)}
                                    className="text-slate-400 font-bold hover:text-slate-600 transition-colors py-4 px-6 text-[10px] uppercase tracking-widest"
                                >
                                    Try another symptom
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-md border border-slate-100 flex items-start gap-6">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-shield-heart text-2xl"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Smart Discovery</h3>
                            <p className="text-slate-500 font-medium text-sm leading-relaxed">Our AI mapping connects common symptoms to medical specializations instantly.</p>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-md border border-slate-100 flex items-start gap-6">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-user-doctor text-2xl"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Verified Doctors</h3>
                            <p className="text-slate-500 font-medium text-sm leading-relaxed">Once suggested, find verified doctors in your area with direct phone contact.</p>
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-slate-100 p-8 rounded-[2rem] border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest text-center leading-relaxed">
                        <strong className="text-slate-600">Important Disclaimer:</strong> This tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. If you think you may have a medical emergency, call your doctor or emergency services immediately.
                    </p>
                </div>
            </main>
        </div>
    );
}

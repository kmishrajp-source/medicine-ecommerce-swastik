"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { Link } from "@/i18n/navigation";

export default function SymptomHelperPage() {
    const { cartCount, toggleCart } = useCart();
    const [symptom, setSymptom] = useState("");
    const [suggestion, setSuggestion] = useState(null);
    const [mapping, setMapping] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetch('/api/symptoms')
            .then(res => res.json())
            .then(data => {
                if (data.success) setMapping(data.mappings);
            });
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        setIsLoading(true);
        const input = symptom.toLowerCase().trim();
        
        // AI-Simulated Intent Matching
        setTimeout(() => {
            let foundMatch = null;
            for (const item of mapping) {
                if (input.includes(item.symptom.toLowerCase())) {
                    foundMatch = item.suggestedSpecialization;
                    break;
                }
            }

            if (foundMatch) {
                setSuggestion(foundMatch);
            } else {
                setSuggestion("General Physician"); // High-conversion Default
            }
            setIsLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            <main className="max-w-5xl mx-auto px-6 pt-44 pb-24">
                <div className="text-center mb-20">
                    <div className="inline-block bg-blue-600 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.3em] mb-8 shadow-xl shadow-blue-100">
                        AI Symptom Helper <i className="fa-solid fa-wand-sparkles ml-2"></i>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-[0.9] tracking-tighter uppercase">
                        Find the Right <br/> <span className="text-blue-600">Specialist</span> Instantly
                    </h1>
                    <p className="text-xl text-slate-400 font-bold uppercase tracking-widest text-[10px] max-w-xl mx-auto leading-relaxed">
                        Enter your symptoms below and our smart mapping system will suggest the best doctor type for your consultation.
                    </p>
                </div>

                <div className="bg-slate-900 rounded-[4rem] p-12 md:p-20 shadow-2xl shadow-slate-200 border border-slate-800 mb-20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-20 translate-x-20 group-hover:bg-blue-600/20 transition-all duration-700"></div>
                    
                    <form onSubmit={handleSearch} className="space-y-10 relative z-10">
                        <div>
                            <label className="block text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6">What are you experiencing?</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={symptom}
                                    onChange={(e) => setSymptom(e.target.value)}
                                    placeholder="e.g. Sharp chest pain, mild fever, blurred vision..."
                                    className="w-full p-10 rounded-3xl bg-white/5 border-2 border-white/10 text-2xl font-black text-white focus:border-blue-600 focus:ring-0 placeholder:text-slate-600 transition-all"
                                    required
                                />
                                {isLoading && (
                                    <div className="absolute right-8 top-1/2 -translate-y-1/2">
                                        <i className="fa-solid fa-spinner fa-spin text-blue-600 text-2xl"></i>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-8 rounded-3xl text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/40 transition-all active:scale-[0.98]"
                        >
                            Analyze Medical Intent <i className="fa-solid fa-chevron-right ml-2 text-xs"></i>
                        </button>
                    </form>

                    {suggestion && !isLoading && (
                        <div className="mt-20 pt-20 border-t border-white/5 text-center animate-in fade-in slide-in-from-bottom-12 duration-1000">
                            <p className="text-blue-400 font-black uppercase text-[10px] tracking-[0.4em] mb-6">Discovery Result</p>
                            <h2 className="text-5xl md:text-7xl font-black text-white mb-12 tracking-tighter uppercase">{suggestion}</h2>
                            <div className="flex flex-col md:flex-row gap-6 justify-center">
                                <Link 
                                    href={`/doctors?specialization=${encodeURIComponent(suggestion)}`}
                                    className="bg-white text-slate-900 font-black px-12 py-6 rounded-2xl hover:bg-blue-50 transition-all shadow-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-3"
                                >
                                    Find {suggestion}s Near Me <i className="fa-solid fa-map-pin"></i>
                                </Link>
                                <button 
                                    onClick={() => setSuggestion(null)}
                                    className="text-white/40 font-black hover:text-white transition-colors py-4 px-8 text-[10px] uppercase tracking-widest"
                                >
                                    Try Another Symptom
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
                    <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 group hover:bg-white hover:shadow-2xl transition-all duration-500">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 text-2xl mb-8 shadow-sm group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-user-shield"></i>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Verified Matches</h3>
                        <p className="text-slate-500 font-bold text-sm tracking-tight leading-relaxed">Our system is mapped to over 50 specific medical specializations to ensure high-accuracy discovery.</p>
                    </div>
                    <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 group hover:bg-white hover:shadow-2xl transition-all duration-500">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 text-2xl mb-8 shadow-sm group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-bolt-lightning"></i>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tighter">No Registration</h3>
                        <p className="text-slate-500 font-bold text-sm tracking-tight leading-relaxed">Search and connect with specialists instantly. No login required for patient discovery.</p>
                    </div>
                </div>

                {/* Disclaimer Layer */}
                <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-relaxed max-w-2xl mx-auto">
                        <strong className="text-slate-600">Medical Disclaimer:</strong> This tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician. If you think you may have a medical emergency, call emergency services immediately.
                    </p>
                </div>
            </main>
        </div>
    );
}

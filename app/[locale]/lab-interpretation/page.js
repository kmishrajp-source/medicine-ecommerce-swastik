"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import Link from 'next/link';

export default function LabInterpretationPage() {
    const { data: session } = useSession();
    const { cartCount, toggleCart } = useCart();
    
    const [fileUrl, setFileUrl] = useState("");
    const [status, setStatus] = useState("IDLE"); // IDLE, SCANNING, SUCCESS, ERROR
    const [results, setResults] = useState(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Only allow PDF or images
            if (file.type.match('image.*') || file.type === 'application/pdf') {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFileUrl(reader.result);
                    simulateAIAnalysis();
                };
                reader.readAsDataURL(file);
            } else {
                alert("Please upload a PDF or Image file.");
            }
        }
    };

    const simulateAIAnalysis = () => {
        setStatus("SCANNING");
        
        setTimeout(() => {
            setResults({
                title: "Comprehensive Metabolic Panel (Mock Data)",
                date: new Date().toLocaleDateString(),
                summary: "Your report indicates mostly normal levels, but there is a slight elevation in fasting glucose and LDL cholesterol. It is recommended to consult with a physician.",
                metrics: [
                    { name: "Fasting Blood Sugar", value: "110 mg/dL", reference: "70-99 mg/dL", status: "HIGH", color: "text-red-600", bg: "bg-red-50" },
                    { name: "Total Cholesterol", value: "210 mg/dL", reference: "< 200 mg/dL", status: "BORDERLINE", color: "text-amber-600", bg: "bg-amber-50" },
                    { name: "Hemoglobin", value: "14.5 g/dL", reference: "13.8-17.2 g/dL", status: "NORMAL", color: "text-emerald-600", bg: "bg-emerald-50" },
                    { name: "Vitamin D", value: "28 ng/mL", reference: "30-100 ng/mL", status: "LOW", color: "text-amber-600", bg: "bg-amber-50" }
                ],
                recommendedSpecialist: "General Physician / Endocrinologist"
            });
            setStatus("SUCCESS");
        }, 3000);
    };

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            <main className="flex-1" style={{ marginTop: '160px' }}>
                <div className="container mx-auto px-8 py-10 max-w-6xl">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            <i className="fa-solid fa-brain" /> Clinical AI Analysis
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">
                            Lab Report <span className="text-purple-600">Interpretation</span>
                        </h1>
                        <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                            Upload your complex lab reports (PDF/Image). Our AI will instantly decode medical jargon, highlight abnormal metrics, and provide an easy-to-understand summary.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Upload Column */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 h-full flex flex-col justify-center">
                                <label className="block">
                                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center cursor-pointer hover:bg-slate-50 hover:border-purple-400 transition-all relative overflow-hidden group">
                                        <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileSelect} />
                                        
                                        {!fileUrl ? (
                                            <>
                                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-3xl mx-auto mb-6 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                                                    <i className="fa-solid fa-file-waveform" />
                                                </div>
                                                <h3 className="text-lg font-black text-slate-900 mb-2">Upload Lab Report</h3>
                                                <p className="text-xs text-slate-500 mb-4">Click to browse or drag and drop</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PDF, JPG, PNG (Max 10MB)</p>
                                            </>
                                        ) : (
                                            <div className="relative z-10 text-center">
                                                <i className="fa-solid fa-file-pdf text-6xl text-purple-600 mb-4" />
                                                <h3 className="text-sm font-bold text-slate-900">Document Uploaded</h3>
                                                <button className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-purple-600">
                                                    Upload Another
                                                </button>
                                            </div>
                                        )}

                                        {/* Scanning Animation */}
                                        {status === "SCANNING" && (
                                            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center text-purple-600 z-20">
                                                <i className="fa-solid fa-microscope text-5xl mb-4 animate-pulse" />
                                                <h3 className="text-sm font-black uppercase tracking-widest mb-2">Analyzing Biomarkers</h3>
                                                <p className="text-xs text-slate-500">Cross-referencing medical databases...</p>
                                            </div>
                                        )}
                                    </div>
                                </label>

                                <div className="mt-8 bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3"><i className="fa-solid fa-shield-check text-emerald-500 mr-1" /> Privacy Guaranteed</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Your medical data is processed securely and is never stored permanently unless you choose to save it to your ABHA timeline. HIPAA & ABDM compliant.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Results Column */}
                        <div className="lg:col-span-7">
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 min-h-[500px]">
                                {status === "IDLE" && (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-6">
                                            <i className="fa-solid fa-chart-pie opacity-50" />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 mb-2">Awaiting Document</h3>
                                        <p className="text-sm">Upload a lab report on the left to view the AI interpretation here.</p>
                                    </div>
                                )}

                                {status === "SCANNING" && (
                                    <div className="h-full flex flex-col items-center justify-center text-purple-600 text-center">
                                        <i className="fa-solid fa-circle-notch fa-spin text-4xl mb-6" />
                                        <h3 className="text-lg font-black text-slate-900">Decoding Jargon...</h3>
                                    </div>
                                )}

                                {status === "SUCCESS" && results && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-start justify-between mb-8 pb-6 border-b border-slate-100">
                                            <div>
                                                <h2 className="text-xl font-black text-slate-900 mb-1">{results.title}</h2>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Analyzed on {results.date}</p>
                                            </div>
                                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                AI Verified
                                            </span>
                                        </div>

                                        <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl mb-8">
                                            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <i className="fa-solid fa-sparkles" /> Executive Summary
                                            </h3>
                                            <p className="text-slate-700 text-sm leading-relaxed font-medium">
                                                {results.summary}
                                            </p>
                                        </div>

                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Extracted Metrics</h3>
                                        
                                        <div className="space-y-3 mb-8">
                                            {results.metrics.map((metric, idx) => (
                                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl gap-4">
                                                    <div className="flex-1">
                                                        <div className="font-bold text-slate-900 text-sm mb-1">{metric.name}</div>
                                                        <div className="text-[10px] font-bold text-slate-500">Ref: {metric.reference}</div>
                                                    </div>
                                                    <div className="flex items-center gap-4 sm:justify-end">
                                                        <div className="text-lg font-black text-slate-900">{metric.value}</div>
                                                        <div className={`${metric.bg} ${metric.color} px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest w-24 text-center border border-white/50`}>
                                                            {metric.status}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Recommended Next Step</div>
                                                <div className="font-bold text-slate-900 text-sm"><i className="fa-solid fa-user-doctor text-indigo-500 mr-1" /> Consult a {results.recommendedSpecialist}</div>
                                            </div>
                                            <Link href={`/doctors?specialization=${encodeURIComponent(results.recommendedSpecialist)}`} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-500/30 transition-all text-center">
                                                Book Doctor
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}

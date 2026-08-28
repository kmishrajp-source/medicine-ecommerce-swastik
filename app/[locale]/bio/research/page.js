"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function BiomedicalResearchPage() {
  const [lang, setLang] = useState("en");
  const T = (en, hi) => lang === "en" ? en : hi;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <Link href="/bio" className="text-emerald-600 hover:text-emerald-800 font-medium flex items-center">
            <span className="mr-2">←</span> {T("Back to Bio-Health Hub", "बायो-हेल्थ हब पर वापस जाएं")}
          </Link>
          <div className="inline-flex bg-white p-1 rounded-full border shadow-sm gap-1">
            <button onClick={() => setLang("en")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang === "en" ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>English</button>
            <button onClick={() => setLang("hi")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang === "hi" ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>हिंदी</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8 md:p-12 text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            <i className="fa-solid fa-microscope"></i>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
            {T("Biomedical Research", "बायोमेडिकल रिसर्च")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {T(
              "Explore verified summaries of the latest scientific papers, clinical trials, and discoveries in the field of biotechnology and medicine.",
              "जैव प्रौद्योगिकी और चिकित्सा के क्षेत्र में नवीनतम वैज्ञानिक पत्रों, नैदानिक परीक्षणों और खोजों के सत्यापित सारांश देखें।"
            )}
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-8 text-center border border-emerald-900/50">
          <h2 className="text-2xl font-bold text-white mb-4">
            {T("Pharmacogenomics & Medicine", "फार्माकोजीनोमिक्स और चिकित्सा")}
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            {T("Discover how research is finding new ways to match medicines to your specific genes to improve efficacy and reduce side effects.", "खोजें कि अनुसंधान दवाओं को आपके विशिष्ट जीन से मिलाने के नए तरीके कैसे खोज रहा है।")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/bio/pharmacogenomics" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl transition">
              {T("Explore Pharmacogenomics", "फार्माकोजीनोमिक्स एक्सप्लोर करें")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

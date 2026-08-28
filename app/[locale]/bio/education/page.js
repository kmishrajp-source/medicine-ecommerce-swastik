"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function GenomicsEducationPage() {
  const [lang, setLang] = useState("en");
  const T = (en, hi) => lang === "en" ? en : hi;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-8 flex justify-between items-center">
          <Link href="/bio" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
            <span className="mr-2">←</span> {T("Back to Bio-Health Hub", "बायो-हेल्थ हब पर वापस जाएं")}
          </Link>
          <div className="inline-flex bg-white p-1 rounded-full border shadow-sm gap-1">
            <button onClick={() => setLang("en")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang === "en" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>English</button>
            <button onClick={() => setLang("hi")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang === "hi" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>हिंदी</button>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8 md:p-12 text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            <i className="fa-solid fa-dna"></i>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
            {T("Genomics Education", "जीनोमिक्स शिक्षा")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {T(
              "Learn the fundamentals of DNA, genes, genetic sequencing, and how precision medicine is revolutionizing modern healthcare in simple, easy-to-understand terms.",
              "DNA, जीन, आनुवंशिक अनुक्रमण (सिक्वेंसिंग) की मूल बातें जानें, और समझें कि प्रिसिजन मेडिसिन आधुनिक स्वास्थ्य सेवा में कैसे क्रांति ला रही है।"
            )}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-book-open"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{T("Genetics 101", "जेनेटिक्स 101")}</h3>
            <p className="text-gray-600">
              {T("Understand chromosomes, DNA strands, and what your genes actually do inside your body.", "गुणसूत्रों, DNA स्ट्रैंड्स और आपके शरीर के अंदर आपके जीन वास्तव में क्या करते हैं, इसे समझें।")}
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-microscope"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{T("Sequencing Technologies", "सिक्वेंसिंग तकनीक")}</h3>
            <p className="text-gray-600">
              {T("Learn the difference between Whole Genome Sequencing, Exome Sequencing, and standard genotyping.", "होल जीनोम सिक्वेंसिंग, एक्सोम सिक्वेंसिंग और मानक जीनोटाइपिंग के बीच का अंतर जानें।")}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-900 rounded-2xl p-8 text-center border border-blue-900/50">
          <h2 className="text-2xl font-bold text-white mb-4">
            {T("Have questions about genetics?", "क्या आनुवंशिकी के बारे में प्रश्न हैं?")}
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            {T("Chat with our AI Bioinformatics Assistant to learn more about how genetics impacts your health.", "यह जानने के लिए कि आनुवंशिकी आपके स्वास्थ्य को कैसे प्रभावित करती है, हमारे AI बायोइन्फोर्मेटिक्स सहायक से चैट करें।")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/bio" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition">
              {T("Ask AI Assistant", "AI सहायक से पूछें")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

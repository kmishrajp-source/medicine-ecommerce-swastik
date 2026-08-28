"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function LiquidBiopsyPage() {
  const [lang, setLang] = useState("en");
  const T = (en, hi) => lang === "en" ? en : hi;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <Link href="/health-vault-guide" className="text-amber-600 hover:text-amber-800 font-medium flex items-center">
            <span className="mr-2">←</span> {T("Back", "पीछे")}
          </Link>
          <div className="inline-flex bg-white p-1 rounded-full border shadow-sm gap-1">
            <button onClick={() => setLang("en")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang === "en" ? "bg-amber-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>English</button>
            <button onClick={() => setLang("hi")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang === "hi" ? "bg-amber-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>हिंदी</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-8 md:p-12 text-center mb-8">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            <i className="fa-solid fa-microscope"></i>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
            {T("Early Cancer Detection", "प्रारंभिक कैंसर पहचान")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {T(
              "Liquid biopsy uses a simple blood test to detect traces of cancer DNA in your bloodstream long before symptoms appear. Catch it early, when it's most treatable.",
              "लिक्विड बायोप्सी एक साधारण रक्त परीक्षण का उपयोग करती है ताकि लक्षण दिखाई देने से बहुत पहले आपके रक्तप्रवाह में कैंसर DNA के निशानों का पता लगाया जा सके।"
            )}
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-8 text-center border border-amber-900/50">
          <h2 className="text-2xl font-bold text-white mb-4">
            {T("Proactive Health Monitoring", "सक्रिय स्वास्थ्य निगरानी")}
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            {T("Book a liquid biopsy test with our certified partners today.", "आज ही हमारे प्रमाणित भागीदारों के साथ लिक्विड बायोप्सी परीक्षण बुक करें।")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/bio/tests" className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-xl transition">
              {T("Find Partner Labs", "पार्टनर लैब खोजें")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function DiseaseRiskPage() {
  const [lang, setLang] = useState("en");
  const T = (en, hi) => lang === "en" ? en : hi;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-8 flex justify-between items-center">
          <Link href="/health-vault-guide" className="text-violet-600 hover:text-violet-800 font-medium flex items-center">
            <span className="mr-2">←</span> {T("Back", "पीछे")}
          </Link>
          <div className="inline-flex bg-white p-1 rounded-full border shadow-sm gap-1">
            <button onClick={() => setLang("en")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang === "en" ? "bg-violet-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>English</button>
            <button onClick={() => setLang("hi")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang === "hi" ? "bg-violet-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>हिंदी</button>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-8 md:p-12 text-center mb-8">
          <div className="w-20 h-20 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            <i className="fa-solid fa-dna"></i>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
            {T("Predict Disease Risk from DNA", "DNA से बीमारी का खतरा जानें")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {T(
              "Your DNA holds the blueprint of your health. Uncover genetic predispositions to diseases and empower yourself with preventive care tailored to your unique biology.",
              "आपका DNA आपके स्वास्थ्य का खाका रखता है। बीमारियों के प्रति आनुवंशिक प्रवृत्तियों को उजागर करें और अपने अद्वितीय जीव विज्ञान के अनुरूप निवारक देखभाल के साथ खुद को सशक्त बनाएं।"
            )}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-heart-pulse"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{T("Cardiovascular Risk", "हृदय रोग का जोखिम")}</h3>
            <p className="text-gray-600">
              {T("Identify genetic markers associated with heart disease, hypertension, and high cholesterol to take early preventive action.", "हृदय रोग, उच्च रक्तचाप और उच्च कोलेस्ट्रॉल से जुड़े आनुवंशिक मार्करों की पहचान करें ताकि प्रारंभिक निवारक कार्रवाई की जा सके।")}
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-brain"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{T("Neuro-Genetic Check", "न्यूरो-जेनेटिक जांच")}</h3>
            <p className="text-gray-600">
              {T("Learn about your genetic susceptibility to conditions like Alzheimer's and Parkinson's for proactive brain health management.", "सक्रिय मस्तिष्क स्वास्थ्य प्रबंधन के लिए अल्जाइमर और पार्किंसंस जैसी स्थितियों के प्रति अपनी आनुवंशिक संवेदनशीलता के बारे में जानें।")}
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-virus"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{T("Oncology & Cancer", "ऑन्कोलॉजी और कैंसर")}</h3>
            <p className="text-gray-600">
              {T("Discover inherited gene mutations (like BRCA) that may increase your risk of certain cancers.", "विरासत में मिले जीन म्यूटेशन (जैसे BRCA) की खोज करें जो कुछ कैंसर के जोखिम को बढ़ा सकते हैं।")}
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-crutch"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{T("Autoimmune & Metabolic", "ऑटोइम्यून और मेटाबोलिक")}</h3>
            <p className="text-gray-600">
              {T("Understand your risk profile for Type-2 Diabetes, Celiac disease, and other metabolic syndromes.", "टाइप-2 डायबिटीज, सीलिएक रोग और अन्य मेटाबोलिक सिंड्रोम के लिए अपनी जोखिम प्रोफ़ाइल को समझें।")}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-900 rounded-2xl p-8 text-center border border-violet-900/50">
          <h2 className="text-2xl font-bold text-white mb-4">
            {T("Ready to map your future health?", "क्या आप अपने भविष्य के स्वास्थ्य का नक्शा बनाने के लिए तैयार हैं?")}
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            {T("Upload your existing DNA data or book a genomic screening to understand your disease risks.", "अपने मौजूदा DNA डेटा को अपलोड करें या अपनी बीमारी के जोखिमों को समझने के लिए जीनोमिक स्क्रीनिंग बुक करें।")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/bio/tests" className="bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 px-8 rounded-xl transition">
              {T("Book Genomic Test", "जीनोमिक टेस्ट बुक करें")}
            </Link>
            <Link href="/profile" className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-xl transition">
              {T("Upload My DNA Data", "मेरा DNA डेटा अपलोड करें")}
            </Link>
          </div>
        </div>
        
      </div>
    </div>
  );
}

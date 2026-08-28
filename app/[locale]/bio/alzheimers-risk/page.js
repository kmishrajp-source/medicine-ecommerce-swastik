"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function AlzheimersRiskPage() {
  const [lang, setLang] = useState("en");
  const T = (en, hi) => lang === "en" ? en : hi;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <Link href="/health-vault-guide" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
            <span className="mr-2">←</span> {T("Back", "पीछे")}
          </Link>
          <div className="inline-flex bg-white p-1 rounded-full border shadow-sm gap-1">
            <button onClick={() => setLang("en")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang === "en" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>English</button>
            <button onClick={() => setLang("hi")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang === "hi" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>हिंदी</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-8 md:p-12 text-center mb-8">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            <i className="fa-solid fa-brain"></i>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
            {T("Neuro-Genetic Alzheimer's Risk", "न्यूरो-जेनेटिक अल्जाइमर जोखिम")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {T(
              "Certain genetic markers, like APOE-e4, can indicate a higher risk of developing late-onset Alzheimer's. Knowledge is power—understanding your genetic profile can help you make lifestyle choices that support brain health.",
              "APOE-e4 जैसे कुछ आनुवंशिक मार्कर अल्जाइमर के विकसित होने के उच्च जोखिम का संकेत दे सकते हैं। अपनी आनुवंशिक प्रोफ़ाइल को समझने से आपको मस्तिष्क स्वास्थ्य का समर्थन करने वाले जीवनशैली विकल्प बनाने में मदद मिल सकती है।"
            )}
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-8 text-center border border-indigo-900/50">
          <h2 className="text-2xl font-bold text-white mb-4">
            {T("Take Control of Your Cognitive Health", "अपने संज्ञानात्मक स्वास्थ्य पर नियंत्रण रखें")}
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            {T("Connect with genetic counselors to understand your risks and discuss neuroprotective strategies.", "अपने जोखिमों को समझने और न्यूरोप्रोटेक्टिव रणनीतियों पर चर्चा करने के लिए आनुवंशिक सलाहकारों से जुड़ें।")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/bio/counsellors" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition">
              {T("Find a Counselor", "परामर्शदाता खोजें")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function ResearchAlertsPage() {
  const [lang, setLang] = useState("en");
  const T = (en, hi) => lang === "en" ? en : hi;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <Link href="/bio" className="text-amber-600 hover:text-amber-800 font-medium flex items-center">
            <span className="mr-2">←</span> {T("Back to Bio-Health Hub", "बायो-हेल्थ हब पर वापस जाएं")}
          </Link>
          <div className="inline-flex bg-white p-1 rounded-full border shadow-sm gap-1">
            <button onClick={() => setLang("en")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang === "en" ? "bg-amber-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>English</button>
            <button onClick={() => setLang("hi")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang === "hi" ? "bg-amber-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>हिंदी</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-8 md:p-12 text-center mb-8">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            <i className="fa-solid fa-bell"></i>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
            {T("Research Alerts", "रिसर्च अलर्ट")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {T(
              "Subscribe to AI-summarized alerts on specific health topics, rare diseases, or biotechnology trends directly delivered to your inbox.",
              "विशिष्ट स्वास्थ्य विषयों, दुर्लभ बीमारियों, या जैव प्रौद्योगिकी रुझानों पर AI-संक्षेपित अलर्ट की सदस्यता लें।"
            )}
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-8 text-center border border-amber-900/50">
          <h2 className="text-2xl font-bold text-white mb-4">
            {T("Manage Your Preferences", "अपनी प्राथमिकताएँ प्रबंधित करें")}
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            {T("Go to your profile settings to configure which alerts you want to receive.", "आप कौन से अलर्ट प्राप्त करना चाहते हैं, इसे कॉन्फ़िगर करने के लिए अपनी प्रोफ़ाइल सेटिंग पर जाएं।")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/profile" className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-xl transition">
              {T("Manage Alerts in Profile", "प्रोफाइल में अलर्ट प्रबंधित करें")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function GutMicrobiomePage() {
  const [lang, setLang] = useState("en");
  const T = (en, hi) => lang === "en" ? en : hi;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-8 flex justify-between items-center">
          <Link href="/health-vault-guide" className="text-rose-600 hover:text-rose-800 font-medium flex items-center">
            <span className="mr-2">←</span> {T("Back", "पीछे")}
          </Link>
          <div className="inline-flex bg-white p-1 rounded-full border shadow-sm gap-1">
            <button onClick={() => setLang("en")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang === "en" ? "bg-rose-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>English</button>
            <button onClick={() => setLang("hi")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang === "hi" ? "bg-rose-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>हिंदी</button>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-8 md:p-12 text-center mb-8">
          <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            <i className="fa-solid fa-viruses"></i>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
            {T("Gut Microbiome & Immunity", "आंत माइक्रोबायोम और इम्युनिटी")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {T(
              "Your gut is the control center for your immune system. Analyze your microbiome to improve digestion, boost immunity, and enhance overall well-being.",
              "आपकी आंत आपके प्रतिरक्षा प्रणाली का नियंत्रण केंद्र है। पाचन में सुधार, इम्युनिटी बढ़ाने और समग्र कल्याण को बढ़ाने के लिए अपने माइक्रोबायोम का विश्लेषण करें।"
            )}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-shield-virus"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{T("Immune System Support", "प्रतिरक्षा प्रणाली का समर्थन")}</h3>
            <p className="text-gray-600">
              {T("Discover how your unique gut bacteria affect your body's ability to fight infections and inflammation.", "जानें कि आपके अद्वितीय आंत बैक्टीरिया संक्रमण और सूजन से लड़ने की आपके शरीर की क्षमता को कैसे प्रभावित करते हैं।")}
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-bowl-food"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{T("Digestion & Metabolism", "पाचन और मेटाबॉलिज्म")}</h3>
            <p className="text-gray-600">
              {T("Identify imbalances that may cause bloating, discomfort, or metabolic issues and learn how to restore gut health.", "उन असंतुलनों को पहचानें जो सूजन, परेशानी या मेटाबोलिक समस्याओं का कारण बन सकते हैं और आंत के स्वास्थ्य को बहाल करना सीखें।")}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-900 rounded-2xl p-8 text-center border border-rose-900/50">
          <h2 className="text-2xl font-bold text-white mb-4">
            {T("Ready to heal your gut?", "क्या आप अपनी आंत को ठीक करने के लिए तैयार हैं?")}
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            {T("Order a microbiome testing kit or upload recent stool test results for an AI analysis.", "माइक्रोबायोम परीक्षण किट ऑर्डर करें या AI विश्लेषण के लिए हाल ही के मल परीक्षण के परिणाम अपलोड करें।")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/bio/tests" className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-8 rounded-xl transition">
              {T("Order Test Kit", "टेस्ट किट ऑर्डर करें")}
            </Link>
            <Link href="/profile" className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-xl transition">
              {T("Upload Lab Report", "लैब रिपोर्ट अपलोड करें")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

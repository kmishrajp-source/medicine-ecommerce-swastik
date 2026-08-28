"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function PersonalizedNutritionPage() {
  const [lang, setLang] = useState("en");
  const T = (en, hi) => lang === "en" ? en : hi;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-8 flex justify-between items-center">
          <Link href="/health-vault-guide" className="text-emerald-600 hover:text-emerald-800 font-medium flex items-center">
            <span className="mr-2">←</span> {T("Back", "पीछे")}
          </Link>
          <div className="inline-flex bg-white p-1 rounded-full border shadow-sm gap-1">
            <button onClick={() => setLang("en")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang === "en" ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>English</button>
            <button onClick={() => setLang("hi")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang === "hi" ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>हिंदी</button>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8 md:p-12 text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            <i className="fa-solid fa-apple-whole"></i>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
            {T("Personalized Nutrition", "व्यक्तिगत पोषण योजना")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {T(
              "Your DNA determines how your body metabolizes carbs, fats, and vitamins. Stop guessing and get a diet plan built entirely for your unique biology.",
              "आपका DNA तय करता है कि आपका शरीर कार्ब्स, वसा और विटामिन को कैसे पचाता है। अनुमान लगाना बंद करें और अपने शरीर के लिए बनी डाइट प्लान पाएं।"
            )}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-weight-scale"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{T("Weight Management", "वजन प्रबंधन")}</h3>
            <p className="text-gray-600">
              {T("Find out if you are genetically predisposed to regain weight and whether a low-carb, low-fat, or balanced diet works best for your genotype.", "जानें कि क्या आपके शरीर का वजन जल्दी बढ़ता है और आपके लिए लो-कार्ब, लो-फैट या संतुलित डाइट में से क्या बेहतर है।")}
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{T("Food Sensitivities", "फूड सेंसिटिविटी")}</h3>
            <p className="text-gray-600">
              {T("Identify genetic markers linked to lactose intolerance, gluten sensitivity, and caffeine metabolism.", "लैक्टोज असहिष्णुता, ग्लूटेन संवेदनशीलता और कैफीन मेटाबॉलिज्म से जुड़े आनुवंशिक मार्करों की पहचान करें।")}
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-capsules"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{T("Vitamin Deficiencies", "विटामिन की कमी")}</h3>
            <p className="text-gray-600">
              {T("Discover if you have a higher genetic requirement for Vitamin D, B12, Folate, or Iron.", "पता लगाएं कि क्या आपको आनुवंशिक रूप से विटामिन डी, बी12, फोलेट या आयरन की अधिक आवश्यकता है।")}
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-heart-pulse"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{T("Cardiometabolic Health", "कार्डियोमेटाबोलिक स्वास्थ्य")}</h3>
            <p className="text-gray-600">
              {T("Optimize your diet to manage genetically driven cholesterol or blood sugar risks.", "आनुवंशिक रूप से संचालित कोलेस्ट्रॉल या ब्लड शुगर जोखिमों को प्रबंधित करने के लिए अपने आहार को अनुकूलित करें।")}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-900 rounded-2xl p-8 text-center border border-emerald-900/50">
          <h2 className="text-2xl font-bold text-white mb-4">
            {T("Ready to eat right for your genes?", "क्या आप अपने जीन के अनुसार खाने के लिए तैयार हैं?")}
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            {T("Book a Nutrigenomics test or upload your existing genetic data to get started.", "न्यूट्रीजीनोमिक्स टेस्ट बुक करें या अपना मौजूदा जेनेटिक डेटा अपलोड करें।")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/bio/tests" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl transition">
              {T("Book Genetic Test", "जेनेटिक टेस्ट बुक करें")}
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

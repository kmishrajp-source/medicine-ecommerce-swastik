"use client";
import { useState } from "react";
import { Link } from "@/i18n/navigation";

const steps = [
  {
    icon: "fa-user-shield", iconColor: "text-violet-400", bg: "bg-violet-500/10",
    en: { step: "Step 1 → 2", title: "Login & Open Profile", desc: "Register with your mobile number. After login, click the profile icon → My Profile → Health Documents tab." },
    hi: { step: "चरण 1 → 2", title: "लॉगिन करें और प्रोफाइल खोलें", desc: "मोबाइल नंबर से रजिस्टर करें। लॉगिन के बाद प्रोफाइल आइकॉन → मेरी प्रोफाइल → Health Documents टैब पर जाएं।" }
  },
  {
    icon: "fa-cloud-arrow-up", iconColor: "text-emerald-400", bg: "bg-emerald-500/10",
    en: { step: "Step 3 → 4", title: "Upload & Let AI Explain", desc: "Upload prescriptions, lab reports, or genetic files. Tap 'Explain this report' and our AI will break it down in simple language." },
    hi: { step: "चरण 3 → 4", title: "अपलोड करें और AI से समझें", desc: "पर्चे, लैब रिपोर्ट या जेनेटिक फाइलें अपलोड करें। 'इस रिपोर्ट को समझाएं' दबाएं और AI आसान भाषा में समझाएगी।" }
  },
  {
    icon: "fa-dna", iconColor: "text-teal-400", bg: "bg-teal-500/10",
    en: { step: "Step 5 → 6", title: "Share & Unlock Bioinformatics", desc: "Share records securely with any doctor via WhatsApp. Upload genetic data to unlock personalized DNA-based health predictions." },
    hi: { step: "चरण 5 → 6", title: "शेयर करें और बायोइन्फोर्मेटिक्स अनलॉक करें", desc: "किसी भी डॉक्टर के साथ WhatsApp से सुरक्षित शेयर करें। जेनेटिक डेटा अपलोड करके DNA-आधारित स्वास्थ्य भविष्यवाणी पाएं।" }
  }
];

const bioItems = [
  { icon: "fa-dna", color: "text-violet-400", href: "/bio/bioinformatics", en: "Predict disease risk from your DNA", hi: "DNA से बीमारी का खतरा जानें" },
  { icon: "fa-pills", color: "text-blue-400", href: "/bio/pharmacogenomics", en: "Find medicines that match your genes", hi: "आपके जीन के अनुसार दवा खोजें" },
  { icon: "fa-apple-whole", color: "text-emerald-400", href: "/health-vault-guide", en: "Get a nutrition plan built for your biology", hi: "अपने शरीर के लिए अनुकूलित डाइट पाएं" },
  { icon: "fa-microscope", color: "text-amber-400", href: "/labs", en: "Early cancer detection via liquid biopsy", hi: "तरल बायोप्सी से प्रारंभिक कैंसर पहचान" },
  { icon: "fa-viruses", color: "text-rose-400", href: "/bio/tests", en: "Gut microbiome & immunity analysis", hi: "आंत के बैक्टीरिया और इम्युनिटी विश्लेषण" },
  { icon: "fa-brain", color: "text-indigo-400", href: "/bio/bioinformatics", en: "Neuro-genetic Alzheimer's risk check", hi: "न्यूरो-जेनेटिक अल्जाइमर जोखिम जांच" },
];

export default function HomeVaultGuideSection() {
  const [lang, setLang] = useState("en");
  const T = (en, hi) => lang === "en" ? en : hi;

  return (
    <div className="w-full px-6 md:px-8 py-20 bg-slate-950 my-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-16">
          <div>
            <span className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-400/30 text-violet-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              <i className="fa-solid fa-vault"></i>
              {T("Health Vault + Bioinformatics Guide", "हेल्थ वॉल्ट + बायोइन्फोर्मेटिक्स गाइड")}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
              {T("Secure your health documents.", "अपने स्वास्थ्य दस्तावेज़ सुरक्षित करें।")}
              <br />
              <span className="text-violet-400">{T("Unlock the power of your DNA.", "अपने DNA की शक्ति अनलॉक करें।")}</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div className="inline-flex bg-white/10 p-1 rounded-full border border-white/20 gap-1">
              <button onClick={() => setLang("en")} className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${lang === "en" ? "bg-white text-slate-900 shadow-md" : "text-white hover:bg-white/10"}`}>English</button>
              <button onClick={() => setLang("hi")} className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${lang === "hi" ? "bg-white text-slate-900 shadow-md" : "text-white hover:bg-white/10"}`}>हिंदी</button>
            </div>
          </div>
        </div>

        {/* 3-Step Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {steps.map((s, i) => {
            const c = s[lang];
            return (
              <Link key={i} href="/health-vault-guide" className="bg-slate-900 border border-slate-800 rounded-3xl p-7 hover:border-slate-600 hover:-translate-y-1 transition-all duration-300 group block">
                <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.iconColor} flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform`}>
                  <i className={`fa-solid ${s.icon}`}></i>
                </div>
                <div className={`text-[10px] font-black uppercase tracking-widest mb-2 ${s.iconColor}`}>{c.step}</div>
                <h3 className="text-white font-black text-lg mb-3 leading-snug">{c.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{c.desc}</p>
              </Link>
            );
          })}
        </div>

        {/* Bioinformatics Grid */}
        <div className="bg-gradient-to-br from-teal-900/30 to-slate-900 border border-teal-500/20 rounded-[2.5rem] p-8 md:p-12 mb-10">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="md:w-1/3">
              <span className="inline-block bg-teal-500/10 border border-teal-400/20 text-teal-300 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">🧬 Bioinformatics</span>
              <h3 className="text-2xl font-black text-white mb-3 leading-snug">
                {T("What your DNA tells us about your health", "आपका DNA आपकी सेहत के बारे में क्या बताता है")}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {T(
                  "Upload a genetic report to unlock personalized predictions — from disease risk to the right medicine for your genes.",
                  "जेनेटिक रिपोर्ट अपलोड करें और व्यक्तिगत भविष्यवाणियाँ पाएं — बीमारी के खतरे से लेकर आपके जीन के लिए सही दवा तक।"
                )}
              </p>
              <Link href="/health-vault-guide" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-black px-6 py-3 rounded-2xl text-sm transition-all shadow-lg shadow-teal-500/20">
                <i className="fa-solid fa-book-open-reader"></i>
                {T("Read Full Guide", "पूरी गाइड पढ़ें")}
              </Link>
            </div>
            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bioItems.map((item, i) => (
                <Link key={i} href={item.href} className="flex items-center gap-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 hover:border-teal-500/50 hover:bg-slate-800 transition-all group cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 ${item.color} text-lg group-hover:scale-110 transition-transform`}>
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <p className="text-slate-300 text-sm font-semibold leading-snug group-hover:text-white transition-colors">{T(item.en, item.hi)}</p>
                  <i className="fa-solid fa-chevron-right text-slate-600 group-hover:text-teal-400 text-xs ml-auto transition-colors"></i>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA Row */}
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/profile" className="bg-violet-600 hover:bg-violet-500 text-white font-black px-7 py-4 rounded-2xl transition-all shadow-xl shadow-violet-600/20 text-sm">
            <i className="fa-solid fa-user-shield mr-2"></i>{T("Open My Health Vault", "मेरा हेल्थ वॉल्ट खोलें")}
          </Link>
          <Link href="/health-vault-guide" className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold px-7 py-4 rounded-2xl transition-all text-sm">
            <i className="fa-solid fa-circle-question mr-2"></i>{T("How Does This Work?", "यह कैसे काम करता है?")}
          </Link>
          <Link href="/bio" className="text-teal-400 hover:text-teal-300 font-bold text-sm flex items-center gap-2 transition-colors">
            <i className="fa-solid fa-dna"></i>{T("Explore Bioinformatics →", "बायोइन्फोर्मेटिक्स देखें →")}
          </Link>
        </div>

      </div>
    </div>
  );
}

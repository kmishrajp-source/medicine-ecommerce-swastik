"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/context/CartContext";

const steps = [
  { num: "01", icon: "fa-user-plus", iconColor: "text-violet-400", bgColor: "bg-violet-500/10",
    en: { title: "Register & Login", desc: "Visit swastikmedicare.com and click Login / Register. Enter your mobile number, receive an OTP, and verify it to create your secure account.", tip: "Use your own mobile number — this becomes your permanent health identity on Swastik." },
    hi: { title: "रजिस्टर करें और लॉगिन करें", desc: "swastikmedicare.com खोलें और Login / Register पर क्लिक करें। मोबाइल नंबर डालें, OTP आएगा, OTP डालकर अपना खाता बनाएं।", tip: "अपना ही मोबाइल नंबर इस्तेमाल करें — यही आपकी स्थायी स्वास्थ्य पहचान बनेगी।" }
  },
  { num: "02", icon: "fa-id-card", iconColor: "text-blue-400", bgColor: "bg-blue-500/10",
    en: { title: "Open Your Profile", desc: "After login, click the person icon at the top right and select My Profile. You will see tabs for Orders, Prescriptions, Lab Reports, and Health Documents.", tip: "Your profile is completely private — only you can access it." },
    hi: { title: "अपनी प्रोफाइल खोलें", desc: "लॉगिन के बाद ऊपर दाईं तरफ व्यक्ति का आइकॉन दबाएं और मेरी प्रोफाइल पर जाएं। यहाँ Orders, Prescriptions, Lab Reports और Health Documents के टैब मिलेंगे।", tip: "प्रोफाइल पूरी तरह निजी है — सिर्फ आप ही इसे देख सकते हैं।" }
  },
  { num: "03", icon: "fa-file-medical", iconColor: "text-emerald-400", bgColor: "bg-emerald-500/10",
    en: { title: "Upload Health Documents", desc: "Tap Upload Prescription or Upload Report. You can upload Doctor Prescriptions, Lab Reports (Blood, Urine, X-Ray), Discharge Summaries, Insurance Cards, and your ABHA Card.", tip: "Accepted formats: PDF, JPG, PNG. Max 10 MB per file." },
    hi: { title: "स्वास्थ्य दस्तावेज़ अपलोड करें", desc: "पर्चा अपलोड करें या रिपोर्ट अपलोड करें दबाएं। डॉक्टर का पर्चा, लैब रिपोर्ट (खून, पेशाब, X-Ray), डिस्चार्ज सारांश, बीमा कार्ड और ABHA कार्ड अपलोड करें।", tip: "फ़ाइल फॉर्मेट: PDF, JPG, PNG। अधिकतम 10 MB प्रति फ़ाइल।" }
  },
  { num: "04", icon: "fa-robot", iconColor: "text-orange-400", bgColor: "bg-orange-500/10",
    en: { title: "Let AI Explain Your Report", desc: "After uploading a lab report, click Explain this report. Our AI reads every value and explains each result in simple language — no medical degree needed.", tip: "AI explanations are for understanding only. Always follow your doctor's advice." },
    hi: { title: "AI को अपनी रिपोर्ट समझाने दें", desc: "लैब रिपोर्ट अपलोड करने के बाद इस रिपोर्ट को समझाएं दबाएं। AI हर परिणाम को आसान भाषा में समझाएगी — मेडिकल डिग्री की जरूरत नहीं।", tip: "AI की जानकारी केवल समझने के लिए है। हमेशा डॉक्टर की सलाह मानें।" }
  },
  { num: "05", icon: "fa-share-nodes", iconColor: "text-pink-400", bgColor: "bg-pink-500/10",
    en: { title: "Share Securely with Doctor", desc: "When visiting a doctor, click Share next to any document. A temporary 6-hour link is generated. Share via WhatsApp or show the QR code directly to your doctor.", tip: "The link expires automatically. You remain in complete control at all times." },
    hi: { title: "डॉक्टर के साथ सुरक्षित शेयर करें", desc: "डॉक्टर के पास जाते समय किसी भी दस्तावेज़ के बगल में शेयर करें दबाएं। 6 घंटे का अस्थायी लिंक बनेगा। WhatsApp से भेजें या डॉक्टर को QR कोड दिखाएं।", tip: "लिंक अपने आप समाप्त हो जाता है। हर समय आपका पूरा नियंत्रण रहता है।" }
  },
  { num: "06", icon: "fa-dna", iconColor: "text-teal-400", bgColor: "bg-teal-500/10",
    en: { title: "Unlock Bioinformatics Power", desc: "Upload your Genetic Report or Whole Genome file to the vault. Our AI analyses your DNA markers to predict disease risks, recommend ideal medicines, and build a personalized diet plan.", tip: "The most advanced personalised care available to any Indian patient — exclusive to Swastik." },
    hi: { title: "बायोइन्फोर्मेटिक्स की शक्ति अनलॉक करें", desc: "Genetic Report या Whole Genome फ़ाइल वॉल्ट में अपलोड करें। AI आपके DNA मार्करों का विश्लेषण करके बीमारी का खतरा, सही दवाएं और व्यक्तिगत डाइट प्लान बताएगी।", tip: "यह सेवा भारतीय स्वास्थ्य सेवा की अग्रणी तकनीक है — केवल Swastik उपयोगकर्ताओं के लिए।" }
  }
];

const bioCards = [
  { icon: "fa-dna", grad: "from-violet-500 to-purple-600",
    en: { title: "Genomic Risk Prediction", desc: "Your DNA reveals predispositions to Type 2 Diabetes, Heart Disease, Hypertension, and Cancers — before symptoms ever appear." },
    hi: { title: "जीनोमिक जोखिम भविष्यवाणी", desc: "DNA से टाइप 2 डायबिटीज, हृदय रोग, हाई BP और कैंसर की संभावना लक्षण आने से पहले पता चलती है।" }
  },
  { icon: "fa-pills", grad: "from-blue-500 to-cyan-600",
    en: { title: "Pharmacogenomics", desc: "Your genes determine how fast you metabolize drugs. AI picks the medicine that works best for YOUR body, reducing side effects." },
    hi: { title: "फार्माकोजेनॉमिक्स (सही दवा)", desc: "आपके जीन तय करते हैं कि दवा कितना असर करेगी। AI वही दवा चुनती है जो आपके शरीर के लिए सबसे बेहतर है।" }
  },
  { icon: "fa-apple-whole", grad: "from-emerald-500 to-teal-600",
    en: { title: "Personalized Nutrition", desc: "Your genome explains why certain diets work for others but not you. Bioinformatics creates a plan built entirely around your biology." },
    hi: { title: "व्यक्तिगत पोषण योजना", desc: "आपका जीनोम बताता है कि कौन सी डाइट आपके लिए काम करेगी। बायोइन्फोर्मेटिक्स आपके लिए अनुकूलित डाइट प्लान बनाती है।" }
  },
  { icon: "fa-viruses", grad: "from-rose-500 to-pink-600",
    en: { title: "Microbiome Analysis", desc: "Blood and stool DNA analysis reveals your gut microbiome composition — directly linked to immunity, mood, and diabetes control." },
    hi: { title: "माइक्रोबायोम विश्लेषण", desc: "खून और मल DNA विश्लेषण आपके पेट के माइक्रोबायोम को दर्शाता है — इम्युनिटी, मूड और डायबिटीज नियंत्रण से सीधे जुड़ा।" }
  },
  { icon: "fa-microscope", grad: "from-amber-500 to-orange-600",
    en: { title: "Early Cancer Detection", desc: "Liquid biopsy technology detects circulating tumor DNA in blood, catching cancers at Stage 1 — when they are most treatable." },
    hi: { title: "प्रारंभिक कैंसर पहचान", desc: "तरल बायोप्सी खून में ट्यूमर DNA पकड़ती है, जिससे कैंसर स्टेज 1 में — सबसे इलाज योग्य समय — मिल जाता है।" }
  },
  { icon: "fa-brain", grad: "from-indigo-500 to-blue-600",
    en: { title: "Neuro-Genetic Risk", desc: "Gene variants like APOE-e4 are linked to Alzheimer's risk. Early knowledge allows preventative steps decades in advance." },
    hi: { title: "न्यूरो-जेनेटिक जोखिम", desc: "APOE-e4 जैसे जीन वेरिएंट अल्जाइमर के जोखिम से जुड़े हैं। जल्दी जानने से दशकों पहले सावधानी बरतना संभव है।" }
  }
];

const docTypes = [
  { icon: "fa-file-prescription", color: "text-violet-400", en: "Doctor Prescription", hi: "डॉक्टर का पर्चा" },
  { icon: "fa-flask", color: "text-blue-400", en: "Lab Reports", hi: "लैब रिपोर्ट" },
  { icon: "fa-x-ray", color: "text-cyan-400", en: "X-Ray / MRI / CT", hi: "X-Ray / MRI / CT" },
  { icon: "fa-file-medical-alt", color: "text-emerald-400", en: "Discharge Summary", hi: "डिस्चार्ज सारांश" },
  { icon: "fa-dna", color: "text-teal-400", en: "Genetic Reports", hi: "जेनेटिक रिपोर्ट" },
  { icon: "fa-heart-pulse", color: "text-rose-400", en: "ECG / Echo Reports", hi: "ECG / Echo रिपोर्ट" },
  { icon: "fa-shield-halved", color: "text-amber-400", en: "Insurance Card", hi: "बीमा कार्ड" },
  { icon: "fa-id-card", color: "text-orange-400", en: "ABHA Health Card", hi: "ABHA हेल्थ कार्ड" },
];

export default function HealthVaultGuidePage() {
  const { cartCount, toggleCart } = useCart();
  const [lang, setLang] = useState("en");
  const T = (en, hi) => lang === "en" ? en : hi;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

      {/* HERO */}
      <div className="relative pt-36 pb-24 px-6 overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.2)_0%,transparent_65%)] pointer-events-none" />
        <div className="absolute top-10 left-10 w-80 h-80 bg-violet-600 rounded-full blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-teal-600 rounded-full blur-3xl opacity-10 animate-pulse" />
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-400/30 text-violet-300 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <i className="fa-solid fa-vault"></i> Health Vault Guide
          </span>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
            {T("Your Medical Vault", "आपका मेडिकल वॉल्ट")}
            <span className="text-violet-400"> &mdash; {T("Secure & Smart", "सुरक्षित और स्मार्ट")}</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            {T(
              "Store prescriptions, lab reports & documents in your profile. Let AI and bioinformatics turn raw data into personalized health decisions.",
              "अपनी प्रोफाइल में पर्चे, लैब रिपोर्ट और दस्तावेज़ सुरक्षित रखें। AI और बायोइन्फोर्मेटिक्स से व्यक्तिगत स्वास्थ्य निर्णय लें।"
            )}
          </p>
          <div className="inline-flex bg-white/10 p-1.5 rounded-full border border-white/20 mb-8 gap-1">
            <button onClick={() => setLang("en")} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${lang === "en" ? "bg-white text-slate-900 shadow-lg" : "text-white hover:bg-white/10"}`}>English</button>
            <button onClick={() => setLang("hi")} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${lang === "hi" ? "bg-white text-slate-900 shadow-lg" : "text-white hover:bg-white/10"}`}>हिंदी</button>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/profile" className="bg-violet-600 hover:bg-violet-500 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-violet-600/25">
              <i className="fa-solid fa-user-shield mr-2"></i>{T("Open My Health Vault", "मेरा हेल्थ वॉल्ट खोलें")}
            </Link>
            <Link href="/bio" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-2xl transition-all">
              <i className="fa-solid fa-dna mr-2"></i>{T("Explore Bioinformatics", "बायोइन्फोर्मेटिक्स देखें")}
            </Link>
          </div>
        </div>
      </div>

      {/* STEP-BY-STEP GUIDE */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
              {T("Step-by-Step Guide", "चरण-दर-चरण मार्गदर्शिका")}
            </span>
            <h2 className="text-3xl md:text-4xl font-black">{T("How to Save Documents in Your Profile", "प्रोफाइल में दस्तावेज़ कैसे सेव करें")}</h2>
          </div>
          <div className="space-y-6">
            {steps.map((step, idx) => {
              const c = step[lang];
              return (
                <div key={idx} className="flex gap-6 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-2xl ${step.bgColor} ${step.iconColor} flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <i className={`fa-solid ${step.icon}`}></i>
                    </div>
                    {idx < steps.length - 1 && <div className="w-0.5 h-8 bg-slate-700 mt-2"></div>}
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 flex-1 mb-2 hover:border-slate-600 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${step.iconColor}`}>{step.num}</span>
                      <h3 className="text-white font-black text-lg">{c.title}</h3>
                    </div>
                    <p className="text-slate-300 leading-relaxed mb-4">{c.desc}</p>
                    <div className="flex items-start gap-2 bg-slate-900/60 rounded-xl px-4 py-3">
                      <i className="fa-solid fa-lightbulb text-yellow-400 text-sm mt-0.5 flex-shrink-0"></i>
                      <p className="text-slate-400 text-sm">{c.tip}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BIOINFORMATICS SECTION */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(20,184,166,0.1)_0%,transparent_65%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block bg-teal-500/10 border border-teal-400/20 text-teal-300 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">🧬 Bioinformatics</span>
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              {T("How Bioinformatics ", "बायोइन्फोर्मेटिक्स आपकी ")}
              <span className="text-teal-400">{T("Transforms Your Health", "सेहत कैसे बदलती है")}</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {T("Your uploaded genetic reports unlock the most advanced personalised medicine system available to any Indian patient today.", "आपकी जेनेटिक रिपोर्ट आज किसी भी भारतीय मरीज़ के लिए उपलब्ध सबसे उन्नत व्यक्तिगत चिकित्सा प्रणाली को अनलॉक करती है।")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {bioCards.map((card, i) => {
              const c = card[lang];
              return (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-7 hover:border-slate-600 hover:-translate-y-1 transition-all duration-300 group">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.grad} flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform`}>
                    <i className={`fa-solid ${card.icon}`}></i>
                  </div>
                  <h3 className="text-white font-black text-lg mb-3">{c.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{c.desc}</p>
                </div>
              );
            })}
          </div>

          {/* DNA Explainer */}
          <div className="bg-gradient-to-br from-teal-900/50 to-slate-900 border border-teal-500/20 rounded-3xl p-10 flex flex-col md:flex-row items-center gap-10">
            <div className="text-center md:w-1/3">
              <div className="text-8xl mb-4">🧬</div>
              <div className="text-4xl font-black text-teal-400">3,000,000,000+</div>
              <div className="text-slate-400 font-bold text-sm mt-1">{T("Base Pairs in Your DNA", "आपके DNA में बेस पेयर")}</div>
            </div>
            <div className="md:w-2/3">
              <h3 className="text-2xl font-black text-white mb-6">{T("How Swastik Bioinformatics Works", "Swastik बायोइन्फोर्मेटिक्स कैसे काम करती है")}</h3>
              <div className="space-y-4">
                {[
                  { en: "You upload your genetic test file (from labs like Strand Life Sciences or MedGenome).", hi: "आप अपनी जेनेटिक टेस्ट फाइल अपलोड करते हैं (Strand Life Sciences या MedGenome जैसी लैब से)।" },
                  { en: "Our engine maps your SNPs against 10,000+ disease associations in global medical databases.", hi: "हमारा इंजन आपके SNP को वैश्विक डेटाबेस में 10,000+ बीमारी संबंधों से जोड़ता है।" },
                  { en: "You receive a personalized report: risk scores, safe medicines for your genotype, and a nutrition plan.", hi: "आपको व्यक्तिगत रिपोर्ट मिलती है: जोखिम स्कोर, आपके जीनोटाइप के लिए सुरक्षित दवाएं, और पोषण योजना।" },
                  { en: "Your doctor (with your consent) can access the report to prescribe more accurately than ever before.", hi: "आपके डॉक्टर (आपकी अनुमति से) इस रिपोर्ट से पहले से कहीं ज्यादा सटीक दवा लिख सकते हैं।" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">{i + 1}</div>
                    <p className="text-slate-300 text-sm leading-relaxed">{T(item.en, item.hi)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DOCUMENT TYPES */}
      <section className="py-16 px-6 bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-center mb-10">{T("What Documents Can You Store?", "आप कौन से दस्तावेज़ स्टोर कर सकते हैं?")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {docTypes.map((doc, i) => (
              <div key={i} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex flex-col items-center text-center hover:border-slate-500 transition-all">
                <i className={`fa-solid ${doc.icon} ${doc.color} text-3xl mb-3`}></i>
                <span className="text-slate-300 text-xs font-bold leading-tight">{T(doc.en, doc.hi)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-violet-900/50 to-slate-900 border border-violet-500/20 rounded-3xl p-10">
            <div className="text-5xl mb-6">🔐</div>
            <h3 className="text-2xl md:text-3xl font-black mb-4">{T("Your Health Story, In One Place", "आपकी स्वास्थ्य कहानी, एक जगह")}</h3>
            <p className="text-slate-400 mb-8">{T("Login today to start building your personal health vault. It is free, private, and powered by AI.", "आज ही लॉगिन करें और अपना व्यक्तिगत हेल्थ वॉल्ट बनाना शुरू करें। यह मुफ्त, निजी और AI से संचालित है।")}</p>
            <Link href="/login" className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-black px-10 py-4 rounded-2xl transition-all shadow-xl shadow-violet-600/25 text-lg">
              <i className="fa-solid fa-lock-open mr-2"></i>{T("Get Started Free", "मुफ्त शुरू करें")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

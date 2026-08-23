"use client";
import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import Image from "next/image";

// ── Expanded Magazine Article Pool ──────────────────────────────────────────────
const articlePool = [
    {
        id: 1,
        category: "Diabetes Innovations",
        image: "https://images.unsplash.com/photo-1611077544719-75f85025a1e7?q=80&w=800&auto=format&fit=crop",
        en: {
            title: "The Artificial Pancreas: Automated Insulin Delivery (AID)",
            excerpt: "The ultimate breakthrough for Type 1 Diabetes: A closed-loop system where the glucose monitor automatically tells the insulin pump exactly how much insulin to deliver.",
            content: "The 'Artificial Pancreas' or Automated Insulin Delivery (AID) system combines a CGM, an insulin pump, and an advanced AI algorithm. The algorithm acts as the brain, constantly reading blood sugar levels and automatically adjusting the background (basal) insulin delivery every 5 minutes. This takes the immense mental burden off patients, allowing them to sleep safely without fear of severe hypoglycemia."
        },
        hi: {
            title: "कृत्रिम अग्न्याशय (Artificial Pancreas): स्वचालित इंसुलिन डिलीवरी (AID)",
            excerpt: "टाइप 1 डायबिटीज के लिए सबसे बड़ी सफलता: एक क्लोज्ड-लूप सिस्टम जहां ग्लूकोज मॉनिटर स्वचालित रूप से इंसुलिन पंप को बताता है कि कितना इंसुलिन देना है।",
            content: "'कृत्रिम अग्न्याशय' या स्वचालित इंसुलिन डिलीवरी (AID) प्रणाली एक CGM, एक इंसुलिन पंप और एक उन्नत AI एल्गोरिदम को जोड़ती है। एल्गोरिथ्म मस्तिष्क के रूप में कार्य करता है, जो लगातार रक्त शर्करा के स्तर को पढ़ता है और हर 5 मिनट में पृष्ठभूमि (बेसल) इंसुलिन वितरण को स्वचालित रूप से समायोजित करता है। यह रोगियों के मानसिक बोझ को कम करता है, जिससे वे गंभीर हाइपोग्लाइसीमिया के डर के बिना सुरक्षित रूप से सो सकते हैं।"
        }
    },
    {
        id: 2,
        category: "Respiratory (Asthma/COPD)",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop",
        en: {
            title: "Smart Inhalers: Breathing Easier with Bluetooth",
            excerpt: "Bluetooth-enabled inhalers track every dose you take, reminding you if you missed one, and mapping local air quality to warn you of asthma triggers.",
            content: "Adherence is the biggest challenge in chronic asthma and COPD. Smart inhalers attach a small sensor to standard inhalers. They record the exact time of medication use and sync with an app. Some advanced apps cross-reference your usage with local weather, pollen counts, and pollution levels to identify what triggers your asthma attacks."
        },
        hi: {
            title: "स्मार्ट इनहेलर: ब्लूटूथ के साथ सांस लेना हुआ आसान",
            excerpt: "ब्लूटूथ-सक्षम इनहेलर आपके द्वारा ली गई हर डोज़ को ट्रैक करते हैं, अगर आप चूक जाते हैं तो याद दिलाते हैं, और अस्थमा ट्रिगर्स की चेतावनी देने के लिए स्थानीय वायु गुणवत्ता को मैप करते हैं।",
            content: "क्रोनिक अस्थमा और COPD में दवा का सही समय पर सेवन (Adherence) सबसे बड़ी चुनौती है। स्मार्ट इनहेलर मानक इनहेलर में एक छोटा सेंसर लगाते हैं। वे दवा के उपयोग का सटीक समय रिकॉर्ड करते हैं और एक ऐप के साथ सिंक करते हैं। कुछ उन्नत ऐप आपके अस्थमा के हमलों को ट्रिगर करने वाले कारणों की पहचान करने के लिए स्थानीय मौसम, पराग (pollen) की संख्या और प्रदूषण के स्तर के साथ आपके उपयोग को क्रॉस-रेफरेंस करते हैं।"
        }
    },
    {
        id: 3,
        category: "Cardiology (Heart Care)",
        image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=800&auto=format&fit=crop",
        en: {
            title: "AI-Powered ECG Smartwatches: Your Personal Cardiologist",
            excerpt: "Smartwatches can now take clinical-grade ECGs from your wrist, detecting silent arrhythmias like Atrial Fibrillation before they cause a stroke.",
            content: "Wearable technology has moved beyond counting steps. Devices like the Apple Watch and specialized medical wearables now include FDA and CDSCO approved ECG sensors. They constantly monitor heart rhythms in the background. If they detect an irregular heartbeat (AFib), they instantly alert the user to seek medical help, preventing thousands of strokes annually."
        },
        hi: {
            title: "AI-पावर्ड ECG स्मार्टवॉच: आपका पर्सनल कार्डियोलॉजिस्ट",
            excerpt: "स्मार्टवॉच अब आपकी कलाई से क्लिनिकल-ग्रेड ECG ले सकती हैं, जिससे स्ट्रोक (पक्षाघात) होने से पहले एट्रियल फाइब्रिलेशन जैसी साइलेंट अतालता (arrhythmias) का पता चल जाता है।",
            content: "वियरेबल तकनीक अब केवल कदम गिनने से आगे बढ़ गई है। Apple Watch और विशेष मेडिकल वियरेबल्स जैसे उपकरणों में अब FDA और CDSCO स्वीकृत ECG सेंसर शामिल हैं। वे बैकग्राउंड में लगातार हृदय की लय की निगरानी करते हैं। यदि वे अनियमित धड़कन (AFib) का पता लगाते हैं, तो वे तुरंत उपयोगकर्ता को चिकित्सा सहायता लेने के लिए सचेत करते हैं, जिससे सालाना हजारों स्ट्रोक को रोका जा सकता है।"
        }
    },
    {
        id: 4,
        category: "Diabetes Technology",
        image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop",
        en: {
            title: "Continuous Glucose Monitors (CGM): The End of Finger Pricks?",
            excerpt: "New wearable sensors track your blood sugar 24/7 without painful needle pricks. They connect directly to your smartphone.",
            content: "For decades, managing diabetes meant painful daily finger pricks. Today, Continuous Glucose Monitors (CGMs) like FreeStyle Libre and Dexcom have revolutionized care. A tiny sensor sits on your arm for 14 days, measuring glucose levels in your interstitial fluid. This data is beamed to an app, showing trends and predicting hypos before they happen."
        },
        hi: {
            title: "कंटीन्यूअस ग्लूकोज मॉनिटर (CGM): क्या अब उंगली में सुई चुभाने की जरूरत नहीं?",
            excerpt: "नए वियरेबल सेंसर बिना दर्दनाक सुई के 24/7 आपके ब्लड शुगर को ट्रैक करते हैं। ये सीधे आपके स्मार्टफोन से जुड़ते हैं।",
            content: "दशकों से, डायबिटीज को मैनेज करने का मतलब था रोज़ाना उंगली में सुई चुभाना। आज, फ्रीस्टाइल लिब्रे और डेक्सकॉम जैसे कंटीन्यूअस ग्लूकोज मॉनिटर (CGM) ने देखभाल में क्रांति ला दी है। एक छोटा सेंसर आपकी बांह पर 14 दिनों तक रहता है, जो आपके इंटरस्टीशियल फ्लूइड में ग्लूकोज लेवल को मापता है। यह डेटा एक ऐप पर भेजा जाता है, जो रुझान दिखाता है और हाइपो होने से पहले भविष्यवाणी करता है।"
        }
    },
    {
        id: 5,
        category: "Neurology",
        image: "https://images.unsplash.com/photo-1559757175-9c84918eeb6f?q=80&w=800&auto=format&fit=crop",
        en: {
            title: "Digital Therapeutics: Video Games as Prescriptions for ADHD",
            excerpt: "The FDA has authorized the first-ever video game treatment to improve attention function in children with ADHD.",
            content: "Medicine isn't just pills anymore. 'EndeavorRx' is a prescription-only video game designed to target and stimulate the neural systems involved in attention function. Clinical trials showed significant improvements in children with ADHD. This marks a new era of 'Digital Therapeutics' where software is actively treating neurological and cognitive conditions."
        },
        hi: {
            title: "डिजिटल थेरेप्यूटिक्स: ADHD के लिए प्रिस्क्रिप्शन के रूप में वीडियो गेम",
            excerpt: "FDA ने ADHD वाले बच्चों में ध्यान समारोह (attention function) में सुधार करने के लिए पहली बार वीडियो गेम उपचार को अधिकृत किया है।",
            content: "दवा अब सिर्फ गोलियां नहीं है। 'EndeavorRx' एक केवल-प्रिस्क्रिप्शन वाला वीडियो गेम है जिसे ध्यान समारोह में शामिल तंत्रिका तंत्र को लक्षित और उत्तेजित करने के लिए डिज़ाइन किया गया है। नैदानिक ​​परीक्षणों में ADHD वाले बच्चों में महत्वपूर्ण सुधार दिखाया गया है। यह 'डिजिटल थेरेप्यूटिक्स' के एक नए युग को चिह्नित करता है जहां सॉफ्टवेयर सक्रिय रूप से न्यूरोलॉजिकल और संज्ञानात्मक स्थितियों का इलाज कर रहा है।"
        }
    },
    {
        id: 6,
        category: "Oncology (Cancer)",
        image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=800&auto=format&fit=crop",
        en: {
            title: "Liquid Biopsies: Detecting Cancer from a Simple Blood Test",
            excerpt: "A revolutionary blood test can now detect fragments of tumor DNA long before cancer shows up on traditional scans.",
            content: "Traditional cancer screening involves invasive tissue biopsies. 'Liquid Biopsy' technology can detect circulating tumor DNA (ctDNA) in a standard blood draw. This means we can detect multiple types of cancer at Stage 1, monitor how well a tumor is responding to chemotherapy in real-time, and catch relapses months earlier than traditional imaging methods."
        },
        hi: {
            title: "तरल बायोप्सी (Liquid Biopsy): साधारण ब्लड टेस्ट से कैंसर का पता लगाना",
            excerpt: "एक क्रांतिकारी रक्त परीक्षण अब पारंपरिक स्कैन पर कैंसर के दिखाई देने से बहुत पहले ट्यूमर डीएनए के अंशों का पता लगा सकता है।",
            content: "पारंपरिक कैंसर स्क्रीनिंग में इनवेसिव टिश्यू बायोप्सी शामिल है। 'तरल बायोप्सी' तकनीक एक मानक रक्त ड्रा में ट्यूमर डीएनए (ctDNA) का पता लगा सकती है। इसका मतलब है कि हम स्टेज 1 पर कई प्रकार के कैंसर का पता लगा सकते हैं, वास्तविक समय में यह निगरानी कर सकते हैं कि ट्यूमर कीमोथेरेपी का कितनी अच्छी तरह जवाब दे रहा है, और पारंपरिक इमेजिंग विधियों की तुलना में महीनों पहले रिलैप्स को पकड़ सकते हैं।"
        }
    },
    {
        id: 7,
        category: "Preventive Health",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
        en: {
            title: "Smart Rings: The Silent Health Guardians",
            excerpt: "Ultra-compact smart rings like Oura are predicting illnesses before symptoms appear by tracking minute changes in body temperature.",
            content: "Unlike bulky smartwatches, smart rings are worn 24/7. They track heart rate variability, blood oxygen, and basal body temperature with high precision. During the pandemic, studies showed these rings could predict illness up to 3 days before symptoms appeared by detecting tiny spikes in body temperature. They are also revolutionizing sleep tracking and women's health."
        },
        hi: {
            title: "स्मार्ट रिंग्स: मूक स्वास्थ्य रक्षक (Silent Health Guardians)",
            excerpt: "Oura जैसी अल्ट्रा-कॉम्पैक्ट स्मार्ट रिंग शरीर के तापमान में सूक्ष्म परिवर्तनों को ट्रैक करके लक्षण दिखाई देने से पहले बीमारियों की भविष्यवाणी कर रही हैं।",
            content: "भारी स्मार्टवॉच के विपरीत, स्मार्ट रिंग 24/7 पहनी जाती हैं। वे उच्च सटीकता के साथ हृदय गति परिवर्तनशीलता, रक्त ऑक्सीजन और बेसल शरीर के तापमान को ट्रैक करते हैं। महामारी के दौरान, अध्ययनों से पता चला कि ये छल्ले शरीर के तापमान में छोटे स्पाइक्स का पता लगाकर लक्षण दिखाई देने से 3 दिन पहले बीमारी की भविष्यवाणी कर सकते हैं। वे स्लीप ट्रैकिंग और महिलाओं के स्वास्थ्य में भी क्रांति ला रहे हैं।"
        }
    },
    {
        id: 8,
        category: "Pharmacology",
        image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=800&auto=format&fit=crop",
        en: {
            title: "AI in Drug Discovery: Finding Cures in Days, Not Decades",
            excerpt: "Artificial Intelligence is sifting through millions of chemical combinations to invent new medicines faster than humanly possible.",
            content: "It typically takes 10-15 years and billions of dollars to bring a new drug to market. AI systems, like Google's AlphaFold, are changing this. By accurately predicting protein structures, AI can simulate how different drugs will bind to diseases in a computer, skipping years of lab work. We are now seeing the very first AI-designed drugs entering human clinical trials."
        },
        hi: {
            title: "दवा की खोज में AI: दशकों में नहीं, दिनों में इलाज खोजना",
            excerpt: "आर्टिफिशियल इंटेलिजेंस इंसानों की तुलना में तेजी से नई दवाओं का आविष्कार करने के लिए लाखों रासायनिक संयोजनों को छान रहा है।",
            content: "एक नई दवा को बाजार में लाने में आमतौर पर 10-15 साल और अरबों डॉलर लगते हैं। Google के AlphaFold जैसे AI सिस्टम इसे बदल रहे हैं। प्रोटीन संरचनाओं की सटीक भविष्यवाणी करके, AI यह अनुकरण कर सकता है कि विभिन्न दवाएं कंप्यूटर में बीमारियों से कैसे बंधेंगी, जिससे प्रयोगशाला के काम के वर्षों बच जाएंगे। अब हम मानव नैदानिक ​​परीक्षणों में प्रवेश करने वाली पहली AI-डिज़ाइन की गई दवाओं को देख रहे हैं।"
        }
    }
];

// Helper: Calculate week number to rotate articles automatically
function getCurrentWeekNumber() {
    const epoch = new Date("2024-01-01T00:00:00Z"); // fixed start point
    const now = new Date();
    return Math.floor((now - epoch) / (7 * 24 * 60 * 60 * 1000));
}

// Get the 4 active articles for this week
function getActiveArticles() {
    const weekNum = getCurrentWeekNumber();
    
    // Reverse the pool so index 0 is the newest in the array context, 
    // but we just cycle through it. 
    // The "newest" article index cycles forward each week.
    const newestIndex = weekNum % articlePool.length;
    
    const active = [];
    for (let i = 0; i < 4; i++) {
        // Go backwards to get the current week and 3 previous weeks
        let idx = (newestIndex - i) % articlePool.length;
        if (idx < 0) idx += articlePool.length; 
        
        // Add dynamic date labeling based on how many weeks ago it was "published"
        const isCurrentWeek = i === 0;
        const article = { ...articlePool[idx] };
        article.displayDate = isCurrentWeek 
            ? "This Week (New)" 
            : `${i} Week${i > 1 ? 's' : ''} Ago`;
        article.isNew = isCurrentWeek;

        active.push(article);
    }
    return active;
}

export default function MedicalMagazinePage() {
    const { cartCount, toggleCart } = useCart();
    const [language, setLanguage] = useState('en'); // 'en' or 'hi'
    const [activeArticles, setActiveArticles] = useState([]);

    // Calculate on mount to avoid hydration mismatch
    React.useEffect(() => {
        setActiveArticles(getActiveArticles());
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            {/* Hero Section */}
            <div className="bg-indigo-900 pt-32 pb-20 px-6 text-center text-white relative overflow-hidden">
                {/* Decorative background circles */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="inline-block bg-white/20 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-white/30 backdrop-blur-sm">
                        📰 Swastik Medical Magazine
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-tight">
                        The Future of <span className="text-indigo-300">Chronic Care</span>
                    </h1>
                    <p className="text-lg md:text-xl text-indigo-100 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
                        Explore the latest technological breakthroughs in treating Diabetes, Heart Disease, and Asthma. 
                        <br className="hidden md:block" />
                        <span className="text-white font-bold opacity-80 text-sm mt-2 block">डायबिटीज और क्रोनिक बीमारियों की नई तकनीकों के बारे में पढ़ें।</span>
                    </p>

                    {/* Language Toggle */}
                    <div className="inline-flex bg-white/10 p-1.5 rounded-full border border-white/20 backdrop-blur-md">
                        <button 
                            onClick={() => setLanguage('en')}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${language === 'en' ? 'bg-white text-indigo-900 shadow-lg' : 'text-white hover:bg-white/10'}`}
                        >
                            Read in English
                        </button>
                        <button 
                            onClick={() => setLanguage('hi')}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${language === 'hi' ? 'bg-white text-indigo-900 shadow-lg' : 'text-white hover:bg-white/10'}`}
                        >
                            हिंदी में पढ़ें
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 py-16 -mt-10 relative z-20">
                <div className="space-y-12">
                    {activeArticles.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">Loading magazine...</div>
                    ) : (
                        activeArticles.map((article, index) => {
                            const content = article[language];
                            const isEven = index % 2 === 0;

                            return (
                                <div key={article.id} className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group">
                                    
                                    {/* Image Section */}
                                    <div className={`md:w-2/5 relative h-64 md:h-auto overflow-hidden ${isEven ? 'md:order-1' : 'md:order-2'}`}>
                                        <div className="absolute inset-0 bg-indigo-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                                        <img 
                                            src={article.image} 
                                            alt={content.title}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                                            <span className="bg-white/90 backdrop-blur-sm text-indigo-900 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg inline-block w-max">
                                                {article.category}
                                            </span>
                                            {article.isNew && (
                                                <span className="bg-rose-500/90 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg inline-block w-max animate-pulse">
                                                    New 🔥
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className={`md:w-3/5 p-8 md:p-12 flex flex-col justify-center ${isEven ? 'md:order-2' : 'md:order-1'}`}>
                                        <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${article.isNew ? 'text-rose-500' : 'text-slate-400'}`}>
                                            {article.displayDate}
                                        </p>
                                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 leading-tight group-hover:text-indigo-600 transition-colors">
                                            {content.title}
                                        </h2>
                                    <p className="text-lg text-indigo-600 font-bold leading-snug mb-4">
                                        {content.excerpt}
                                    </p>
                                    <p className="text-slate-600 font-medium leading-relaxed mb-8">
                                        {content.content}
                                    </p>

                                    {/* Action Buttons */}
                                    <div className="mt-auto flex flex-wrap gap-4">
                                        <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-md">
                                            <i className="fa-regular fa-bookmark mr-2"></i> 
                                            {language === 'en' ? 'Save Article' : 'लेख सहेजें'}
                                        </button>
                                        <button className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-100 transition-colors">
                                            <i className="fa-solid fa-share-nodes mr-2"></i> 
                                            {language === 'en' ? 'Share' : 'शेयर करें'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    }))}
                </div>

                {/* Newsletter Subscribe */}
                <div className="mt-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-200">
                    <i className="fa-solid fa-envelope-open-text text-6xl opacity-20 absolute -right-4 -bottom-4 transform -rotate-12"></i>
                    
                    <h3 className="text-3xl md:text-4xl font-black mb-4 relative z-10">
                        {language === 'en' ? 'Stay Updated on Health Tech' : 'स्वास्थ्य तकनीक पर अपडेट रहें'}
                    </h3>
                    <p className="text-emerald-100 font-medium text-lg max-w-xl mx-auto mb-8 relative z-10">
                        {language === 'en' 
                            ? 'Get the latest medical innovations and Swastik platform updates delivered straight to your inbox.' 
                            : 'नवीनतम चिकित्सा नवाचार और स्वास्तिक प्लेटफॉर्म अपडेट सीधे अपने इनबॉक्स में प्राप्त करें।'}
                    </p>
                    
                    <form className="max-w-md mx-auto flex gap-2 relative z-10" onSubmit={(e) => { e.preventDefault(); alert(language === 'en' ? 'Subscribed!' : 'सब्सक्राइब हो गया!'); }}>
                        <input 
                            type="email" 
                            placeholder={language === 'en' ? 'Enter your email address' : 'अपना ईमेल पता दर्ज करें'} 
                            required
                            className="flex-1 px-6 py-4 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-emerald-300 transition-all"
                        />
                        <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-wider transition-colors shadow-lg shadow-slate-900/20">
                            {language === 'en' ? 'Subscribe' : 'सब्सक्राइब'}
                        </button>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}

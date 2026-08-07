"use client";
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

const aiModules = [
  {
    id: 'prescription',
    icon: 'fa-file-prescription',
    title: 'AI Prescription Intelligence',
    tagline: 'Safety-first medicine dispensing',
    color: 'from-blue-600 to-indigo-600',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    desc: 'Analyzes uploaded prescriptions using NLP to detect duplicate therapies, contraindications, and dosage anomalies before any medicine is dispensed. Automatically alerts the pharmacist and patient of potential safety risks.',
    features: ['NLP-based prescription parsing', 'Drug interaction detection', 'Dosage anomaly alerts', 'Multi-medicine cross-referencing', 'Pharmacist alert system'],
    link: '/prescription-analyzer',
  },
  {
    id: 'symptom',
    icon: 'fa-stethoscope',
    title: 'AI Symptom Checker',
    tagline: 'Instant intelligent health triage',
    color: 'from-emerald-600 to-teal-600',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    desc: 'A multi-lingual conversational engine allowing patients to input their symptoms. The AI cross-references clinical datasets to perform preliminary triage and route high-risk patients to specialists or emergency services.',
    features: ['Multi-lingual symptom input', 'Clinical dataset matching', 'Risk stratification triage', 'Specialist routing', 'Emergency escalation'],
    link: '/symptom-checker',
  },
  {
    id: 'drug-interaction',
    icon: 'fa-pills',
    title: 'AI Drug Interaction Engine',
    tagline: 'Prevent harmful drug combinations',
    color: 'from-rose-600 to-pink-600',
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    desc: 'A real-time engine that checks drug-drug interactions across complex polypharmacy regimens. Evaluates severity, clinical significance, and recommends safer alternatives for healthcare providers.',
    features: ['10,000+ drug database', 'Severity grading (Major/Minor)', 'Alternative medicine suggestions', 'Physician alert integration', 'Population-specific warnings'],
    link: '/drug-interaction-checker',
  },
  {
    id: 'dosage',
    icon: 'fa-weight-scale',
    title: 'AI Dosage Analysis',
    tagline: 'Right dose, right patient, right time',
    color: 'from-purple-600 to-violet-600',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    desc: 'Calculates personalized dosage recommendations based on patient demographics (age, weight, renal function) and co-morbidities. Flags out-of-range prescriptions with evidence-based corrections.',
    features: ['Patient demographics integration', 'Weight/age-based calculations', 'Renal & hepatic adjustments', 'Pediatric dose safety', 'Out-of-range flagging'],
    link: '/ai-assistant',
  },
  {
    id: 'reminder',
    icon: 'fa-bell',
    title: 'AI Medication Reminder',
    tagline: 'Never miss a critical dose',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    desc: 'An AI-driven adherence engine that predicts refill windows from digital prescriptions and purchase history. Sends automated, localized WhatsApp reminders before patients run out of critical chronic medication.',
    features: ['Prescription-linked scheduling', 'WhatsApp reminder automation', 'Refill prediction AI', 'Chronic disease priority', 'Multi-language notifications'],
    link: '/subscription',
  },
  {
    id: 'risk',
    icon: 'fa-heart-pulse',
    title: 'AI Health Risk Assessment',
    tagline: 'Predict before it becomes critical',
    color: 'from-red-600 to-rose-600',
    bg: 'bg-red-50',
    text: 'text-red-600',
    desc: 'Analyzes patient vitals, lab reports, and lifestyle data to generate a personalized health risk score. Proactively flags patients at high risk for Diabetes, Hypertension, and Cardiovascular disease.',
    features: ['Vitals trend analysis', 'Lab report integration', 'Chronic disease risk scoring', 'Personalized health report', 'Preventive care alerts'],
    link: '/labs',
  },
  {
    id: 'preventive',
    icon: 'fa-shield-virus',
    title: 'AI Preventive Healthcare',
    tagline: 'Wellness before illness',
    color: 'from-green-600 to-emerald-600',
    bg: 'bg-green-50',
    text: 'text-green-600',
    desc: 'Recommends preventive screenings, vaccinations, and lifestyle modifications based on patient age, gender, family history, and environmental factors. Connects to lab tests automatically.',
    features: ['Vaccination schedule AI', 'Preventive screening calendar', 'Lifestyle modification plans', 'Dietary recommendations', 'Lab test integration'],
    link: '/labs',
  },
  {
    id: 'clinical',
    icon: 'fa-brain',
    title: 'AI Clinical Decision Support',
    tagline: 'Augmenting physician intelligence',
    color: 'from-sky-600 to-blue-600',
    bg: 'bg-sky-50',
    text: 'text-sky-600',
    desc: 'Provides evidence-based treatment pathways and differential diagnosis support for doctors on the Swastik Medicare network. Helps doctors make faster, safer clinical decisions.',
    features: ['Evidence-based protocols', 'Differential diagnosis support', 'Treatment guideline suggestions', 'Drug selection assistance', 'Patient history summarization'],
    link: '/doctors',
  },
  {
    id: 'assistant',
    icon: 'fa-robot',
    title: 'AI Digital Healthcare Assistant',
    tagline: '24×7 healthcare intelligence',
    color: 'from-indigo-600 to-purple-600',
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    desc: 'An always-on conversational AI assistant that helps patients understand their medicines, find doctors, book labs, and navigate the healthcare ecosystem. Powered by healthcare-specific language models.',
    features: ['Medicine queries & dosage', 'Doctor & lab booking', 'Report interpretation', 'Healthcare navigation', 'Multi-lingual support'],
    link: '/ai-assistant',
  },
];

export default function AiClient() {
  const { cartCount, toggleCart } = useCart();

  return (
    <>
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      <main style={{ marginTop: '160px' }}>

        {/* HERO */}
        <div className="relative bg-slate-900 py-24 md:py-36 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(79,70,229,0.3)_0%,_transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(16,185,129,0.2)_0%,_transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'2\' cy=\'2\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")' }} />

          <div className="container mx-auto px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400" /></span>
              Proprietary Technology
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6">
              AI Healthcare <br /><span className="text-indigo-400">Platform</span>
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-3xl mx-auto mb-12">
              Swastik Medicare's proprietary AI Healthcare Engine integrates clinical intelligence across prescriptions, symptoms, drugs, and preventive care — making healthcare safer, faster, and more accessible for every Indian.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/ai-assistant" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/30">
                <i className="fa-solid fa-robot mr-2" /> Try AI Assistant
              </Link>
              <Link href="/symptom-checker" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/20">
                <i className="fa-solid fa-stethoscope mr-2" /> Symptom Checker
              </Link>
            </div>
          </div>
        </div>

        {/* ARCHITECTURE DIAGRAM */}
        <div className="container mx-auto px-8 py-20">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-3 block">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">AI Engine Architecture</h2>
          </div>
          <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 overflow-hidden relative border border-slate-800">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600" />
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 items-center text-center text-white">
              {[
                { label: 'Patient Input', icon: 'fa-mobile-screen', color: 'text-blue-400' },
                { label: 'NLP Engine', icon: 'fa-language', color: 'text-indigo-400' },
                { label: 'Clinical DB', icon: 'fa-database', color: 'text-emerald-400' },
                { label: 'AI Models', icon: 'fa-microchip', color: 'text-purple-400' },
                { label: 'Risk Score', icon: 'fa-gauge-high', color: 'text-amber-400' },
                { label: 'Smart Action', icon: 'fa-bolt', color: 'text-rose-400' },
              ].map((node, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <i className={`fa-solid ${node.icon} text-2xl ${node.color}`} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{node.label}</span>
                  {i < 5 && <i className="fa-solid fa-arrow-right hidden md:block absolute translate-x-20 text-slate-700" />}
                </div>
              ))}
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Safety First', icon: 'fa-shield-check', desc: 'Every drug interaction and dosage anomaly is flagged before dispensing', color: 'text-emerald-400' },
                { title: 'Evidence Based', icon: 'fa-book-medical', desc: 'Powered by globally validated clinical datasets and WHO drug databases', color: 'text-blue-400' },
                { title: 'Privacy Protected', icon: 'fa-lock', desc: 'All analysis happens with consent-based encrypted health data only', color: 'text-purple-400' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <i className={`fa-solid ${item.icon} text-2xl ${item.color} mb-3 block`} />
                  <h4 className="text-white font-black uppercase tracking-tight mb-2">{item.title}</h4>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI MODULES GRID */}
        <div className="container mx-auto px-8 pb-24">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-3 block">AI Modules</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">9 AI-Powered Capabilities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiModules.map((mod) => (
              <div key={mod.id} className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all overflow-hidden flex flex-col">
                <div className={`bg-gradient-to-br ${mod.color} p-8 text-white`}>
                  <i className={`fa-solid ${mod.icon} text-4xl mb-4 block opacity-90`} />
                  <h3 className="text-xl font-black uppercase tracking-tight leading-tight mb-1">{mod.title}</h3>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{mod.tagline}</p>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">{mod.desc}</p>
                  <ul className="space-y-2 mb-8 flex-1">
                    {mod.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <i className={`fa-solid fa-circle-check ${mod.text}`} /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={mod.link} className={`block w-full text-center py-3 rounded-2xl text-xs font-black uppercase tracking-widest ${mod.bg} ${mod.text} hover:opacity-80 transition-opacity`}>
                    Explore <i className="fa-solid fa-arrow-right ml-1" />
                  </Link>
                </div>
              </div>
            ))}

            {/* Future Research Card */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 text-white flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                  <i className="fa-solid fa-flask text-3xl text-indigo-400" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">Future AI Research</h3>
                <p className="text-slate-400 text-sm mb-6">Coming in the next phase of Swastik Medicare's innovation pipeline.</p>
                <ul className="space-y-3">
                  {['Wearable health monitoring', 'Population health analytics', 'AI radiology screening', 'Predictive epidemic modelling', 'Voice-based rural AI interface'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-300">
                      <i className="fa-solid fa-arrow-right text-indigo-400" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/innovation" className="mt-8 block w-full text-center py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white transition-all">
                View Innovation Roadmap
              </Link>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 py-24 text-white text-center">
          <div className="container mx-auto px-8">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">Partner with India's<br /><span className="text-blue-200">Healthcare AI Platform</span></h2>
            <p className="text-indigo-200 text-lg font-medium max-w-2xl mx-auto mb-10">Hospitals, Pharma companies, and Government health programs — integrate with Swastik Medicare's AI engine via our secure healthcare API.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/partner" className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-all">
                <i className="fa-solid fa-handshake mr-2" /> Become a Partner
              </Link>
              <Link href="/about" className="bg-white/10 border border-white/30 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all">
                <i className="fa-solid fa-building mr-2" /> About Us
              </Link>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}

"use client";
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

const pillars = [
  {
    icon: 'fa-file-shield',
    title: 'Encrypted Health Records',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    description: 'All patient health records — including prescriptions, lab reports, and consultation notes — are encrypted at rest using AES-256 and in transit using TLS 1.3.',
    details: ['AES-256 data encryption', 'TLS 1.3 in-transit security', 'Encrypted database backups', 'Zero-knowledge architecture'],
  },
  {
    icon: 'fa-users-gear',
    title: 'Role-Based Access Control',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    description: 'Granular role-based access ensures that delivery agents see only addresses, doctors see only clinical records, and pharmacists see only prescription data.',
    details: ['Granular permission layers', 'Patient / Doctor / Pharmacist / Rider separation', 'Admin audit trail', 'Auto-expiring session tokens'],
  },
  {
    icon: 'fa-handshake-angle',
    title: 'Consent-Based Data Sharing',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    description: 'No doctor, pharmacist, or third party can access a patient\'s health history without the patient\'s explicit digital consent — aligned with ABDM Consent Manager principles.',
    details: ['Explicit consent before data access', 'ABDM Consent Manager aligned', 'Revocable consent at any time', 'Consent audit log'],
  },
  {
    icon: 'fa-key',
    title: 'Secure Authentication',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    description: 'Secure login infrastructure with OTP verification, JWT tokens with short expiry, and infrastructure-level protection against brute force and credential stuffing attacks.',
    details: ['OTP-based verification', 'JWT with short expiry', 'Rate limiting & brute-force protection', 'Device fingerprinting ready'],
  },
  {
    icon: 'fa-scroll',
    title: 'Audit Logging',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    description: 'All critical actions — prescription uploads, medicine dispensing, patient data access — are permanently logged in a tamper-evident audit trail for compliance and accountability.',
    details: ['Immutable audit trail', 'Prescription access logging', 'Order fulfillment audit', 'Admin action logging'],
  },
  {
    icon: 'fa-code-branch',
    title: 'API Security',
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    description: 'All platform APIs are secured with authentication headers, CORS restrictions, input validation, and rate-limiting to prevent unauthorized access and data leakage.',
    details: ['Bearer token authentication', 'Strict CORS policies', 'Input sanitization & validation', 'API rate limiting'],
  },
  {
    icon: 'fa-cloud',
    title: 'Cloud Security',
    color: 'text-sky-500',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    description: 'Hosted on enterprise-grade cloud infrastructure with automated vulnerability scanning, DDoS protection, and infrastructure-as-code for reproducible secure deployments.',
    details: ['DDoS protection', 'Automated vulnerability scans', 'Infrastructure-as-code', 'Geographic redundancy'],
  },
  {
    icon: 'fa-arrows-rotate',
    title: 'Business Continuity',
    color: 'text-teal-500',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    description: 'Automated daily database backups, disaster recovery planning, and 99.9% uptime SLA targets ensure that the platform remains available for emergency healthcare needs.',
    details: ['Daily automated backups', 'Point-in-time recovery', 'Disaster recovery plan', '99.9% uptime target'],
  },
  {
    icon: 'fa-shield-halved',
    title: 'Cyber Security Framework',
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    description: 'Following CERT-In guidelines and ISO 27001 principles, our cyber security framework covers threat modelling, vulnerability management, and incident response planning.',
    details: ['CERT-In guideline compliance', 'ISO 27001 roadmap', 'Vulnerability management', 'Incident response plan'],
  },
  {
    icon: 'fa-user-lock',
    title: 'Privacy-First Architecture',
    color: 'text-violet-500',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    description: 'Privacy is embedded at every architectural layer — from database schema design that minimizes data collection, to strict data retention policies and the right to erasure.',
    details: ['Data minimization principle', 'Purpose-limited data collection', 'Strict retention policies', 'Right to erasure (DPDP Act)'],
  },
];

export default function SecurityClient() {
  const { cartCount, toggleCart } = useCart();

  return (
    <>
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      <main style={{ marginTop: '160px' }}>

        {/* HERO */}
        <div className="relative bg-slate-900 py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.2)_0%,_transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
          <div className="container mx-auto px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              <i className="fa-solid fa-shield-halved" /> Healthcare Data Security
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6">
              Patient Data<br /><span className="text-emerald-400">Security</span>
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-3xl mx-auto">
              Your health data belongs to you — not to us. Swastik Medicare is built on a Privacy-First Architecture with enterprise-grade security protocols at every layer.
            </p>
          </div>
        </div>

        {/* TRUST SCORES */}
        <div className="container mx-auto px-8 -mt-10 relative z-10 mb-20">
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 'AES-256', label: 'Data Encryption', icon: 'fa-lock', color: 'text-emerald-500' },
              { value: 'TLS 1.3', label: 'Transit Security', icon: 'fa-shield-halved', color: 'text-blue-500' },
              { value: '10+', label: 'Security Layers', icon: 'fa-layer-group', color: 'text-indigo-500' },
              { value: '99.9%', label: 'Uptime Target', icon: 'fa-circle-check', color: 'text-amber-500' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <i className={`fa-solid ${item.icon} text-3xl ${item.color} mb-3 block`} />
                <div className="text-2xl font-black text-slate-900 mb-1 tracking-tighter">{item.value}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SECURITY PILLARS */}
        <div className="container mx-auto px-8 pb-24">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-3 block">Security Architecture</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">10 Security Pillars</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pillars.map((pillar, i) => (
              <div key={i} className={`bg-white border-2 ${pillar.border} rounded-3xl p-8 hover:shadow-xl transition-all group`}>
                <div className={`w-14 h-14 ${pillar.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <i className={`fa-solid ${pillar.icon} text-2xl ${pillar.color}`} />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-3">{pillar.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">{pillar.description}</p>
                <ul className="space-y-2">
                  {pillar.details.map((d, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <i className={`fa-solid fa-check ${pillar.color}`} /> {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* DATA FLOW DIAGRAM */}
        <div className="bg-slate-900 py-20 text-white">
          <div className="container mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">How Patient Data Flows</h2>
              <p className="text-slate-400 text-sm max-w-2xl mx-auto">Every step is logged, encrypted, and requires explicit consent before the next step can proceed.</p>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-5xl mx-auto flex-wrap">
              {[
                { step: '1', label: 'Patient Consents', icon: 'fa-user-check', color: 'bg-emerald-500' },
                { step: '→', label: '', icon: '', color: '' },
                { step: '2', label: 'Encrypted Upload', icon: 'fa-lock', color: 'bg-blue-500' },
                { step: '→', label: '', icon: '', color: '' },
                { step: '3', label: 'Role Verified', icon: 'fa-users-gear', color: 'bg-indigo-500' },
                { step: '→', label: '', icon: '', color: '' },
                { step: '4', label: 'Audit Logged', icon: 'fa-scroll', color: 'bg-purple-500' },
                { step: '→', label: '', icon: '', color: '' },
                { step: '5', label: 'Action Taken', icon: 'fa-bolt', color: 'bg-amber-500' },
              ].map((node, i) => (
                node.label ? (
                  <div key={i} className={`${node.color} rounded-2xl p-6 text-center w-36 flex-shrink-0`}>
                    <i className={`fa-solid ${node.icon} text-2xl mb-2 block`} />
                    <span className="text-xs font-black uppercase tracking-widest">{node.label}</span>
                  </div>
                ) : (
                  <div key={i} className="text-slate-600 text-2xl font-bold hidden md:block">→</div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* REGULATORY FRAMEWORK */}
        <div className="bg-slate-50 py-20">
          <div className="container mx-auto px-8 text-center">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Regulatory Framework</h2>
            <p className="text-slate-500 mb-12 max-w-xl mx-auto">Swastik Medicare's security architecture is aligned with the following frameworks and regulations:</p>
            <div className="flex flex-wrap gap-4 justify-center">
              {['Digital Personal Data Protection Act 2023', 'ABDM Data & Privacy Policy', 'CERT-In Cyber Security Guidelines', 'ISO 27001 ISMS', 'IT Act 2000 (Section 43A)', 'HIPAA-equivalent standards', 'NDHM Data Privacy Policy'].map((item, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 shadow-sm flex items-center gap-2">
                  <i className="fa-solid fa-check-circle text-emerald-500" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-20 text-white text-center">
          <div className="container mx-auto px-8">
            <i className="fa-solid fa-shield-halved text-5xl text-emerald-400 mb-6 block" />
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Your Health. Your Data. Your Control.</h2>
            <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto mb-10">Questions about how your data is protected? Our Data Protection Officer is available to answer any query.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/privacy-policy" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all">
                <i className="fa-solid fa-file-shield mr-2" /> Privacy Policy
              </Link>
              <Link href="/trust" className="bg-white/10 border border-white/30 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all">
                <i className="fa-solid fa-shield-check mr-2" /> Trust & Compliance
              </Link>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}

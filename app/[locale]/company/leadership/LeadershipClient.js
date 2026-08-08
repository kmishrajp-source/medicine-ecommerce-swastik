"use client";
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

const teamMembers = [
  {
    name: 'Kishor Mishra',
    role: 'Founder & CEO',
    category: 'executive',
    image: 'fa-user-tie',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    bio: 'Visionary behind Swastik Medicare, with deep expertise in pharmacy operations and digital healthcare scale-up in Tier-2 markets.',
  },
  {
    name: 'Dr. Neha Sharma',
    role: 'Chief Medical Officer',
    category: 'executive',
    image: 'fa-user-doctor',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    bio: 'Leading the clinical validation of AI algorithms and ensuring all telemedicine protocols meet global healthcare standards.',
  },
  {
    name: 'Rahul Verma',
    role: 'Chief Technology Officer',
    category: 'executive',
    image: 'fa-laptop-code',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    bio: 'Architect of the ABDM-ready digital health platform and proprietary NLP models for prescription safety.',
  },
  {
    name: 'Dr. A.K. Singh',
    role: 'Clinical Advisor (Cardiology)',
    category: 'clinical',
    image: 'fa-heart-pulse',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    bio: 'Guiding the development of predictive health risk models for cardiovascular diseases.',
  },
  {
    name: 'Dr. Priya Gupta',
    role: 'Clinical Advisor (Pediatrics)',
    category: 'clinical',
    image: 'fa-baby',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    bio: 'Ensuring strict pediatric dosage safety protocols within the AI drug interaction engine.',
  },
  {
    name: 'Rajesh Kumar',
    role: 'Head of Data Privacy',
    category: 'tech',
    image: 'fa-shield-halved',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    bio: 'Former cybersecurity consultant leading Swastik Medicare\'s ISO 27001 and DPDP Act compliance roadmap.',
  },
];

export default function LeadershipClient() {
  const { cartCount, toggleCart } = useCart();

  const getTeam = (cat) => teamMembers.filter(m => m.category === cat);

  return (
    <>
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      <main style={{ marginTop: '160px' }}>

        {/* HERO */}
        <div className="relative bg-slate-900 py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(79,70,229,0.2)_0%,_transparent_60%)] pointer-events-none" />
          <div className="container mx-auto px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              <i className="fa-solid fa-users" /> Executive Leadership
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6">
              The Minds Behind<br /><span className="text-indigo-400">The Mission</span>
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-3xl mx-auto">
              A diverse team of healthcare veterans, technologists, and clinical experts united by a single goal: making quality digital healthcare accessible to all.
            </p>
          </div>
        </div>

        {/* EXECUTIVE TEAM */}
        <div className="container mx-auto px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">Management Team</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {getTeam('executive').map((member, i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center hover:shadow-xl transition-all group">
                <div className={`w-24 h-24 mx-auto rounded-full ${member.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <i className={`fa-solid ${member.image} text-4xl ${member.color}`} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">{member.name}</h3>
                <div className={`text-xs font-black uppercase tracking-widest ${member.color} mb-4`}>{member.role}</div>
                <p className="text-slate-500 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CLINICAL ADVISORS */}
        <div className="bg-slate-50 py-20">
          <div className="container mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">Clinical Advisory Board</h2>
              <p className="text-slate-500 mt-3 max-w-2xl mx-auto">Validating our AI algorithms and telemedicine protocols to ensure the highest standards of medical safety.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {getTeam('clinical').map((member, i) => (
                <div key={i} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl ${member.bg} flex items-center justify-center flex-shrink-0`}>
                    <i className={`fa-solid ${member.image} text-2xl ${member.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-1">{member.name}</h3>
                    <div className={`text-[10px] font-black uppercase tracking-widest ${member.color} mb-2`}>{member.role}</div>
                    <p className="text-slate-500 text-xs leading-relaxed">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TECH & PRIVACY */}
        <div className="container mx-auto px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">Technology & Security</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {getTeam('tech').map((member, i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center hover:shadow-xl transition-all group">
                <div className={`w-24 h-24 mx-auto rounded-full ${member.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <i className={`fa-solid ${member.image} text-4xl ${member.color}`} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1">{member.name}</h3>
                <div className={`text-[10px] font-black uppercase tracking-widest ${member.color} mb-4`}>{member.role}</div>
                <p className="text-slate-500 text-xs leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}

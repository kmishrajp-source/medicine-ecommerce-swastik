"use client";
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

const nodes = [
  {
    id: 'patient',
    label: 'Patients',
    icon: 'fa-user',
    color: 'bg-emerald-500',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-500',
    desc: 'The center of our ecosystem. Patients get access to unified health records, AI symptom checkers, and instant telemedicine.',
    features: ['ABHA ID Ready', 'Unified Health Records', 'AI Symptom Checker', 'Medicine Reminders']
  },
  {
    id: 'doctor',
    label: 'Doctors',
    icon: 'fa-user-doctor',
    color: 'bg-blue-500',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-500',
    desc: 'Doctors utilize our clinical decision support system for prescription safety, patient history, and remote consultations.',
    features: ['Telemedicine Platform', 'AI Prescription Safety', 'Digital Clinic Management', 'Patient Analytics']
  },
  {
    id: 'pharmacy',
    label: 'Pharmacies',
    icon: 'fa-shop',
    color: 'bg-amber-500',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-500',
    desc: 'Local pharmacies connected to our real-time inventory engine for instant local medicine fulfillment.',
    features: ['Real-time Inventory', 'Auto-restocking', 'Delivery Agent Routing', 'Demand Prediction']
  },
  {
    id: 'lab',
    label: 'Diagnostics',
    icon: 'fa-microscope',
    color: 'bg-purple-500',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-500',
    desc: 'NABL-accredited labs integrated for home sample collection and direct digital report delivery to patient profiles.',
    features: ['Home Collection', 'Digital Reports', 'Trend Analysis', 'Doctor Sharing']
  },
  {
    id: 'ambulance',
    label: 'Emergency',
    icon: 'fa-truck-medical',
    color: 'bg-rose-500',
    borderColor: 'border-rose-400',
    textColor: 'text-rose-500',
    desc: 'GPS-enabled ambulance network for SOS routing to the nearest NABH-accredited hospital.',
    features: ['SOS Routing', 'Live GPS Tracking', 'Hospital Pre-alert', 'First Responder Guide']
  },
  {
    id: 'ai',
    label: 'AI Engine',
    icon: 'fa-brain',
    color: 'bg-indigo-500',
    borderColor: 'border-indigo-400',
    textColor: 'text-indigo-500',
    desc: 'The intelligent layer connecting all nodes. Analyzes prescriptions, prevents drug interactions, and predicts health risks.',
    features: ['NLP Processing', 'Drug Interaction DB', 'Risk Prediction ML', 'Dosage Validator']
  }
];

export default function EcosystemClient() {
  const { cartCount, toggleCart } = useCart();
  const [activeNode, setActiveNode] = useState(nodes[0]);

  return (
    <>
      <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
      <main style={{ marginTop: '160px' }}>

        {/* HERO */}
        <div className="relative bg-slate-900 py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.15)_0%,_transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(99,102,241,0.15)_0%,_transparent_60%)] pointer-events-none" />
          <div className="container mx-auto px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              <i className="fa-solid fa-network-wired" /> Interactive Ecosystem
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6">
              The Connected<br /><span className="text-emerald-400">Health Network</span>
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-3xl mx-auto">
              Swastik Medicare breaks down healthcare silos by connecting all stakeholders through a centralized, AI-powered platform.
            </p>
          </div>
        </div>

        {/* INTERACTIVE DIAGRAM */}
        <div className="container mx-auto px-8 py-20">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            
            {/* Visualizer */}
            <div className="lg:w-1/2 relative aspect-square max-w-lg mx-auto w-full">
              {/* Central Hub */}
              <div className="absolute inset-0 m-auto w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center border-4 border-slate-800 z-20 shadow-2xl">
                <div className="text-center">
                  <i className="fa-solid fa-heart-pulse text-3xl text-emerald-500 mb-1 block" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Swastik</span>
                </div>
              </div>
              
              {/* Orbit Rings */}
              <div className="absolute inset-4 rounded-full border border-slate-200" />
              <div className="absolute inset-16 rounded-full border border-slate-100 border-dashed" />

              {/* Nodes */}
              {nodes.map((node, i) => {
                const angle = (i * 360) / nodes.length;
                const radius = 42; // percentage
                const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
                const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
                const isActive = activeNode.id === node.id;
                
                return (
                  <button
                    key={node.id}
                    onClick={() => setActiveNode(node)}
                    className={`absolute w-20 h-20 -ml-10 -mt-10 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 z-30 ${isActive ? `${node.color} scale-110 shadow-lg shadow-${node.color.split('-')[1]}-500/50 text-white` : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 shadow-sm'}`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <i className={`fa-solid ${node.icon} text-2xl mb-1`} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{node.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Info Panel */}
            <div className="lg:w-1/2 w-full">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-10 relative overflow-hidden transition-all duration-300">
                <div className={`absolute top-0 left-0 w-2 h-full ${activeNode.color}`} />
                <div className={`w-16 h-16 ${activeNode.color} rounded-2xl flex items-center justify-center mb-6 text-white text-3xl shadow-lg`}>
                  <i className={`fa-solid ${activeNode.icon}`} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">{activeNode.label}</h2>
                <p className="text-slate-500 text-lg leading-relaxed mb-8">{activeNode.desc}</p>
                
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Core Capabilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeNode.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 ${activeNode.textColor}`}>
                        <i className="fa-solid fa-check text-[10px]" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* DATA FLOW SECTION */}
        <div className="bg-slate-50 py-20">
          <div className="container mx-auto px-8 text-center max-w-4xl">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Seamless Data Flow</h2>
            <p className="text-slate-500 mb-12">Every action on the Swastik Medicare platform enriches the patient's unified health record, providing doctors with better context for future care.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '1. Generation', desc: 'Patient uses AI Symptom Checker or books a telemedicine consult.', icon: 'fa-mobile-screen' },
                { step: '2. Analysis', desc: 'AI Engine scans doctor\'s prescription against patient\'s medical history.', icon: 'fa-brain' },
                { step: '3. Execution', desc: 'Verified order routes to the nearest local pharmacy partner for delivery.', icon: 'fa-motorcycle' },
              ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200">
                  <i className={`fa-solid ${item.icon} text-3xl text-indigo-500 mb-4 block`} />
                  <div className="font-black text-slate-900 uppercase tracking-widest text-xs mb-2">{item.step}</div>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}

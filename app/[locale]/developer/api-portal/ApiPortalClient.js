'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const endpoints = [
  {
    group: 'Pharmacy & Orders',
    icon: 'fa-pills',
    color: 'emerald',
    apis: [
      { method: 'GET', path: '/api/v1/products', desc: 'Search medicine catalogue by name, category or salt.' },
      { method: 'POST', path: '/api/v1/orders', desc: 'Place a medicine order on behalf of a verified patient.' },
      { method: 'GET', path: '/api/v1/orders/{id}/track', desc: 'Get real-time delivery status of an order.' },
    ],
  },
  {
    group: 'Prescriptions',
    icon: 'fa-file-prescription',
    color: 'indigo',
    apis: [
      { method: 'POST', path: '/api/v1/prescription/upload', desc: 'Upload a prescription image; returns structured AI-parsed data.' },
      { method: 'GET', path: '/api/v1/user/{id}/prescriptions', desc: 'List all prescriptions for a consented patient.' },
    ],
  },
  {
    group: 'Labs & Reports',
    icon: 'fa-microscope',
    color: 'blue',
    apis: [
      { method: 'GET', path: '/api/v1/labs', desc: 'Fetch available diagnostic labs and their test catalogue.' },
      { method: 'POST', path: '/api/v1/labs/book', desc: 'Book a lab test for a patient.' },
      { method: 'GET', path: '/api/v1/reports/{id}', desc: 'Retrieve a structured lab report by report ID.' },
    ],
  },
  {
    group: 'Digital Health Records (PHR)',
    icon: 'fa-notes-medical',
    color: 'violet',
    apis: [
      { method: 'GET', path: '/api/v1/phr/{abhaId}/timeline', desc: 'Fetch patient EHR timeline (requires active ABDM consent).' },
      { method: 'POST', path: '/api/v1/consent/request', desc: 'Submit a data access consent request for a patient.' },
      { method: 'DELETE', path: '/api/v1/consent/{id}', desc: 'Revoke a previously granted consent.' },
    ],
  },
];

const methodColors = {
  GET: 'bg-emerald-100 text-emerald-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-amber-100 text-amber-700',
  DELETE: 'bg-rose-100 text-rose-700',
};

export default function ApiPortalClient() {
  const [activeGroup, setActiveGroup] = useState('Pharmacy & Orders');
  const [env, setEnv] = useState('SANDBOX');

  const active = endpoints.find(e => e.group === activeGroup);

  return (
    <div className="bg-slate-950 min-h-screen flex flex-col text-slate-200 font-mono">
      <div className="font-sans">
        <Navbar />
      </div>
      <main className="flex-1" style={{ marginTop: '140px' }}>

        {/* Header */}
        <section className="relative border-b border-slate-800 py-16 px-6 bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1.5 rounded-full text-xs font-bold mb-6">
              <i className="fa-solid fa-code"></i> Developer API Portal
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 font-sans tracking-tight">
              Build with Swastik Medicare
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mb-8 font-sans">
              Integrate our pharmacy, prescription, lab, and digital health record APIs into your hospital management system, clinic app, or government health portal.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg text-sm border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-300">Sandbox Base URL:</span>
                <code className="text-emerald-400 ml-1">https://sandbox.swastikmed.online/api/v1</code>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border cursor-pointer transition-colors ${env === 'SANDBOX' ? 'bg-amber-900/40 border-amber-700 text-amber-300' : 'bg-emerald-900/40 border-emerald-700 text-emerald-300'}`}
                onClick={() => setEnv(env === 'SANDBOX' ? 'PRODUCTION' : 'SANDBOX')}>
                <i className="fa-solid fa-toggle-on"></i>
                <span>Environment: <strong>{env}</strong></span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Layout */}
        <section className="max-w-6xl mx-auto py-12 px-6 flex flex-col md:flex-row gap-8">

          {/* Sidebar */}
          <aside className="w-full md:w-56 flex-shrink-0">
            <div className="sticky top-8">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">API Modules</p>
              <nav className="flex flex-col gap-1">
                {endpoints.map(ep => (
                  <button
                    key={ep.group}
                    onClick={() => setActiveGroup(ep.group)}
                    className={`text-left px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                      activeGroup === ep.group
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <i className={`fa-solid ${ep.icon} mr-2`}></i>{ep.group}
                  </button>
                ))}
              </nav>

              <div className="mt-8 p-4 bg-slate-900 rounded-xl border border-slate-800">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Authentication</p>
                <code className="text-xs text-emerald-400 block break-all">
                  Authorization: Bearer {'<YOUR_API_KEY>'}
                </code>
              </div>
            </div>
          </aside>

          {/* Endpoint List */}
          <div className="flex-1">
            {active && (
              <div>
                <h2 className="text-xl font-black text-white mb-6 font-sans flex items-center gap-3">
                  <span className={`w-10 h-10 bg-${active.color}-500/20 text-${active.color}-400 rounded-lg flex items-center justify-center`}>
                    <i className={`fa-solid ${active.icon}`}></i>
                  </span>
                  {active.group}
                </h2>

                <div className="space-y-4">
                  {active.apis.map((api, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors group">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-2.5 py-1 rounded text-[11px] font-black tracking-widest ${methodColors[api.method] || 'bg-slate-700 text-slate-300'}`}>
                          {api.method}
                        </span>
                        <code className="text-slate-200 text-sm group-hover:text-indigo-300 transition-colors">
                          {api.path}
                        </code>
                      </div>
                      <p className="text-slate-400 text-sm font-sans">{api.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Sample request box */}
                <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="flex justify-between items-center px-5 py-3 border-b border-slate-800 bg-slate-800/50">
                    <span className="text-xs font-bold text-slate-400">Sample Request</span>
                    <span className="text-xs text-slate-500">cURL</span>
                  </div>
                  <pre className="p-5 text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`curl -X GET \\
  'https://sandbox.swastikmed.online${active.apis[0].path}' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Environment: ${env}'`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Get API Key CTA */}
        <section className="py-16 px-6 border-t border-slate-800 bg-slate-900">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-black text-white mb-3 font-sans">Ready to Integrate?</h2>
            <p className="text-slate-400 mb-8 font-sans">Request a Sandbox API key to start building. Production access is granted after compliance review.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:developer@swastikmed.online" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl transition-all font-sans shadow-lg shadow-indigo-500/20">
                <i className="fa-solid fa-key mr-2"></i> Request API Key
              </a>
              <a href="https://docs.swastikmed.online" target="_blank" rel="noreferrer" className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-4 rounded-xl transition-all border border-slate-700 font-sans">
                <i className="fa-solid fa-book mr-2"></i> Full Docs
              </a>
            </div>
          </div>
        </section>

      </main>
      <div className="font-sans">
        <Footer />
      </div>
    </div>
  );
}

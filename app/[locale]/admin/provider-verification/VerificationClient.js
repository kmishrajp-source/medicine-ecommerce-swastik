'use client';

import React, { useState } from 'react';

export default function VerificationClient() {
  const [activeTab, setActiveTab] = useState('PENDING');

  const providers = [
    { id: 'P1', type: 'DOCTOR', name: 'Dr. A. Sharma', specialty: 'Cardiology', submitted: '2 hours ago', status: 'UNDER_REVIEW' },
    { id: 'P2', type: 'PHARMACY', name: 'City Meds', specialty: 'Form 20/21', submitted: '1 day ago', status: 'SUBMITTED' },
    { id: 'P3', type: 'LAB', name: 'PathCare Labs', specialty: 'NABL Cert', submitted: '3 days ago', status: 'UNVERIFIED' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Provider Verification Center</h1>
          <p className="text-sm text-slate-500">Verify licenses and issue platform badges (ABDM/Government Ready).</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setActiveTab('PENDING')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'PENDING' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Pending (3)</button>
          <button onClick={() => setActiveTab('VERIFIED')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'VERIFIED' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Verified List</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map((p) => (
          <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-lg shadow-inner">
                {p.type === 'DOCTOR' && <i className="fa-solid fa-user-doctor"></i>}
                {p.type === 'PHARMACY' && <i className="fa-solid fa-store"></i>}
                {p.type === 'LAB' && <i className="fa-solid fa-microscope"></i>}
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${p.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                {p.status.replace('_', ' ')}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">{p.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{p.specialty}</p>
            
            <div className="bg-slate-50 p-3 rounded-lg mb-4 text-xs">
              <div className="flex justify-between mb-1">
                <span className="text-slate-500">Submitted</span>
                <span className="font-semibold text-slate-700">{p.submitted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Documents</span>
                <span className="font-semibold text-indigo-600 hover:underline cursor-pointer">2 Files Attached</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-lg transition-colors border border-emerald-200">
                <i className="fa-solid fa-check mr-1"></i> Verify
              </button>
              <button className="flex-1 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg transition-colors border border-slate-200">
                Review Docs
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

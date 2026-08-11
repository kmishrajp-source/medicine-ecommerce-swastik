'use client';

import React, { useState } from 'react';

export default function ReadinessClient() {
  const [activeTab, setActiveTab] = useState('DASHBOARD');

  const programs = [
    { id: 'abdm', name: 'Ayushman Bharat Digital Mission (ABDM)', status: 'PREPARING', score: 65, color: 'emerald' },
    { id: 'dhis', name: 'Digital Health Incentive Scheme (DHIS)', status: 'NOT_STARTED', score: 20, color: 'rose' },
    { id: 'startup', name: 'Startup India / DPIIT', status: 'APPLIED', score: 85, color: 'indigo' },
    { id: 'gem', name: 'Government e-Marketplace (GeM)', status: 'PREPARING', score: 45, color: 'amber' },
    { id: 'birac', name: 'BIRAC Innovation Grants', status: 'NOT_STARTED', score: 10, color: 'slate' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Government Readiness Tracker</h1>
          <p className="text-sm text-slate-500">Track internal compliance for federal healthcare and startup programs.</p>
        </div>
        <div className="text-right bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Readiness Score</div>
          <div className="text-2xl font-black text-emerald-600">45 / 100</div>
        </div>
      </div>

      {/* Program Tracker Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {programs.map((prog) => (
          <div key={prog.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-colors cursor-pointer">
            <div className={`absolute top-0 left-0 w-1 h-full bg-${prog.color}-500`}></div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-slate-900 text-lg w-3/4">{prog.name}</h3>
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-${prog.color}-50 text-${prog.color}-700 border border-${prog.color}-200`}>
                {prog.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 font-semibold">Readiness Score</span>
                <span className={`font-bold text-${prog.color}-600`}>{prog.score}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className={`bg-${prog.color}-500 h-1.5 rounded-full`} style={{ width: `${prog.score}%` }}></div>
              </div>
            </div>

            <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 transition-colors">
              Manage Application
            </button>
          </div>
        ))}
      </div>

      {/* Document Manager Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900"><i className="fa-solid fa-folder-open text-slate-400 mr-2"></i> Document Vault</h2>
          <button className="text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-semibold transition-colors">
            <i className="fa-solid fa-upload mr-1"></i> Upload Document
          </button>
        </div>
        <div className="p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-sm font-bold text-slate-500 uppercase tracking-wider">
                <th className="pb-3 px-4">Document Type</th>
                <th className="pb-3 px-4">Linked Program</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4">Last Updated</th>
                <th className="pb-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold"><i className="fa-solid fa-file-pdf text-rose-500 mr-2"></i> Certificate of Incorporation</td>
                <td className="py-3 px-4">All Programs</td>
                <td className="py-3 px-4"><span className="text-emerald-600 font-bold text-xs"><i className="fa-solid fa-check mr-1"></i> VERIFIED</span></td>
                <td className="py-3 px-4 text-slate-500">12 Jan 2024</td>
                <td className="py-3 px-4 text-right">
                  <button className="text-slate-400 hover:text-indigo-600"><i className="fa-solid fa-eye"></i></button>
                </td>
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold"><i className="fa-solid fa-file-pdf text-rose-500 mr-2"></i> ISO 27001 Security Audit</td>
                <td className="py-3 px-4">ABDM, DHIS</td>
                <td className="py-3 px-4"><span className="text-amber-600 font-bold text-xs"><i className="fa-solid fa-clock mr-1"></i> PENDING UPDATE</span></td>
                <td className="py-3 px-4 text-slate-500">24 Aug 2023</td>
                <td className="py-3 px-4 text-right">
                  <button className="text-slate-400 hover:text-indigo-600"><i className="fa-solid fa-upload"></i></button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold"><i className="fa-solid fa-file-pdf text-rose-500 mr-2"></i> Pharmacy License (Form 20/21)</td>
                <td className="py-3 px-4">ABDM (HFR)</td>
                <td className="py-3 px-4"><span className="text-rose-600 font-bold text-xs"><i className="fa-solid fa-triangle-exclamation mr-1"></i> MISSING</span></td>
                <td className="py-3 px-4 text-slate-500">-</td>
                <td className="py-3 px-4 text-right">
                  <button className="text-slate-400 hover:text-indigo-600"><i className="fa-solid fa-upload"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

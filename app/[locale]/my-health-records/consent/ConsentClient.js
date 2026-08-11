'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ConsentClient() {
  const [activeTab, setActiveTab] = useState('PENDING');

  const consents = [
    { id: 'C1', requester: 'Dr. R. K. Gupta', facility: 'Apollo Hospital', purpose: 'Consultation & Diagnosis', dataTypes: ['Prescriptions', 'Lab Reports'], requestedOn: '10 Aug 2024', expiry: '17 Aug 2024', status: 'PENDING' },
    { id: 'C2', requester: 'PathCare Labs', facility: 'PathCare Main Branch', purpose: 'Upload Lab Results', dataTypes: ['Lab Reports'], requestedOn: '05 Aug 2024', expiry: '05 Sep 2024', status: 'GRANTED' },
    { id: 'C3', requester: 'City Meds Pharmacy', facility: 'City Meds Sector 4', purpose: 'Dispense Medicine', dataTypes: ['Prescriptions'], requestedOn: '01 Aug 2024', expiry: '01 Aug 2024', status: 'EXPIRED' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1" style={{ marginTop: '140px' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Consent Manager</h1>
            <p className="text-slate-500">Manage who can view your digital health records across the Ayushman Bharat network.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex bg-slate-50 border-b border-slate-200">
              <button 
                onClick={() => setActiveTab('PENDING')}
                className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'PENDING' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Pending Requests (1)
              </button>
              <button 
                onClick={() => setActiveTab('GRANTED')}
                className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'GRANTED' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Active Consents (1)
              </button>
              <button 
                onClick={() => setActiveTab('HISTORY')}
                className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'HISTORY' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                History (1)
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {consents.filter(c => 
                  activeTab === 'PENDING' ? c.status === 'PENDING' : 
                  activeTab === 'GRANTED' ? c.status === 'GRANTED' : 
                  (c.status === 'DENIED' || c.status === 'REVOKED' || c.status === 'EXPIRED')
                ).map(consent => (
                  <div key={consent.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xl">
                          {consent.requester.includes('Dr.') ? <i className="fa-solid fa-user-doctor"></i> : <i className="fa-solid fa-hospital"></i>}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">{consent.requester}</h3>
                          <p className="text-sm text-slate-500">{consent.facility}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        consent.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        consent.status === 'GRANTED' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {consent.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg mb-6">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Purpose of Access</span>
                        <span className="text-sm font-semibold text-slate-700">{consent.purpose}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Data Types Requested</span>
                        <div className="flex gap-2">
                          {consent.dataTypes.map((dt, i) => (
                            <span key={i} className="text-xs font-semibold bg-white border border-slate-200 px-2 py-1 rounded text-slate-600">{dt}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Requested On</span>
                        <span className="text-sm font-semibold text-slate-700">{consent.requestedOn}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Access Expiry</span>
                        <span className="text-sm font-semibold text-rose-600">{consent.expiry}</span>
                      </div>
                    </div>

                    {consent.status === 'PENDING' && (
                      <div className="flex gap-3">
                        <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold text-sm transition-all shadow-md shadow-emerald-500/20">
                          Grant Consent
                        </button>
                        <button className="flex-1 bg-white hover:bg-slate-50 text-rose-600 border border-rose-200 py-3 rounded-lg font-bold text-sm transition-all">
                          Deny Request
                        </button>
                      </div>
                    )}
                    
                    {consent.status === 'GRANTED' && (
                      <div className="flex justify-end">
                        <button className="bg-white hover:bg-slate-50 text-rose-600 border border-rose-200 px-6 py-2 rounded-lg font-bold text-sm transition-all">
                          Revoke Access
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                {consents.filter(c => 
                  activeTab === 'PENDING' ? c.status === 'PENDING' : 
                  activeTab === 'GRANTED' ? c.status === 'GRANTED' : 
                  (c.status === 'DENIED' || c.status === 'REVOKED' || c.status === 'EXPIRED')
                ).length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fa-solid fa-inbox text-2xl text-slate-400"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No Records Found</h3>
                    <p className="text-sm text-slate-500">You don't have any {activeTab.toLowerCase()} consent requests.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-4 items-start">
            <i className="fa-solid fa-circle-info text-blue-500 mt-1"></i>
            <div>
              <h4 className="text-sm font-bold text-blue-900 mb-1">Your Data is Secure</h4>
              <p className="text-xs text-blue-800">Under the Ayushman Bharat Digital Mission (ABDM), healthcare providers can only access your records with your explicit consent. You can revoke access at any time. All access logs are recorded in your Security Audit Framework.</p>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function TrustClient() {
  const [activeTab, setActiveTab] = useState('privacy');

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: 'fa-user-shield' },
    { id: 'terms', label: 'Terms & Conditions', icon: 'fa-file-contract' },
    { id: 'data', label: 'Data Security', icon: 'fa-database' },
    { id: 'medical', label: 'Medical Disclaimer', icon: 'fa-stethoscope' },
    { id: 'consent', label: 'Consent Policy', icon: 'fa-handshake' },
    { id: 'grievance', label: 'Grievance Mechanism', icon: 'fa-scale-balanced' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Trust & Compliance Center
          </h1>
          <p className="text-lg text-slate-600">
            Swastik Medicare is committed to the highest standards of data privacy, security, and healthcare compliance. Explore our policies and certifications below.
          </p>
        </div>

        {/* Badges Section */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold">
            <i className="fa-solid fa-shield-check text-emerald-600"></i> Secure Health Data
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
            <i className="fa-solid fa-file-medical text-blue-600"></i> Designed for ABDM Integration
          </div>
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-2 rounded-full text-sm font-semibold">
            <i className="fa-solid fa-lock text-indigo-600"></i> Consent-Based Health Records
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <nav className="flex flex-col space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <i className={`fa-solid ${tab.icon} w-6 text-center mr-2`}></i>
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-8 p-4 bg-slate-100 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Need Help?</h3>
              <p className="text-xs text-slate-600 mb-3">If you have questions about our policies, contact our Grievance Officer.</p>
              <a href="mailto:grievance@swastikmed.online" className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold flex items-center">
                <i className="fa-solid fa-envelope mr-2"></i> Contact Us
              </a>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[500px]">
            {activeTab === 'privacy' && (
              <div className="prose max-w-none text-slate-600">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 m-0">Privacy Policy</h2>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">Version 1.0 (2024)</span>
                </div>
                <p>Swastik Medicare respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.</p>
                <h3 className="text-lg font-bold text-slate-900 mt-6 mb-2">1. Important Information and Who We Are</h3>
                <p>We are the controller and responsible for your personal data. We have appointed a data privacy manager who is responsible for overseeing questions in relation to this privacy policy.</p>
                <h3 className="text-lg font-bold text-slate-900 mt-6 mb-2">2. The Data We Collect About You</h3>
                <p>We may collect, use, store and transfer different kinds of personal data about you including: Identity Data, Contact Data, Health Data (with explicit consent), and Technical Data.</p>
                <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <h4 className="text-emerald-800 font-bold mb-2 flex items-center"><i className="fa-solid fa-download mr-2"></i> Download Full Policy</h4>
                  <p className="text-sm text-emerald-700 mb-3">Get a PDF copy of our complete Privacy Policy for your records.</p>
                  <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">Download PDF</button>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="prose max-w-none text-slate-600">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Data Security Practices</h2>
                <p>At Swastik Medicare, securing patient health information is our highest priority. We implement robust security measures designed to protect your data from unauthorized access, alteration, disclosure, or destruction.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="border border-slate-200 p-5 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <i className="fa-solid fa-lock text-xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">End-to-End Encryption</h3>
                    <p className="text-sm">All sensitive health data and prescriptions are encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.</p>
                  </div>
                  <div className="border border-slate-200 p-5 rounded-xl">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                      <i className="fa-solid fa-shield-halved text-xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Role-Based Access</h3>
                    <p className="text-sm">Strict Role-Based Access Control (RBAC) ensures only authorized medical professionals can access specific health records, and only with patient consent.</p>
                  </div>
                  <div className="border border-slate-200 p-5 rounded-xl">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                      <i className="fa-solid fa-clipboard-list text-xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Audit Logging</h3>
                    <p className="text-sm">Every access to a health record is logged in an immutable audit trail, visible to the patient in their Personal Health Record timeline.</p>
                  </div>
                  <div className="border border-slate-200 p-5 rounded-xl">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-4">
                      <i className="fa-solid fa-server text-xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Secure Cloud Infrastructure</h3>
                    <p className="text-sm">Hosted on secure, ISO 27001 certified cloud infrastructure with automated threat detection and daily encrypted backups.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'consent' && (
              <div className="prose max-w-none text-slate-600">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Consent Management Policy</h2>
                <p>Swastik Medicare operates on a strict consent-based architecture, aligned with Ayushman Bharat Digital Mission (ABDM) guidelines for health data sharing.</p>
                <div className="bg-slate-50 border-l-4 border-emerald-500 p-4 my-6">
                  <p className="font-semibold text-slate-800 m-0">Your Data, Your Control</p>
                  <p className="text-sm mt-1">No doctor, pharmacy, or hospital can access your Personal Health Records without your explicit, time-bound consent.</p>
                </div>
                <ul className="space-y-3 mt-6">
                  <li className="flex items-start"><i className="fa-solid fa-check text-emerald-500 mt-1 mr-3"></i> <span><strong>Purpose Specific:</strong> Consent is requested for a specific purpose (e.g., "Consultation").</span></li>
                  <li className="flex items-start"><i className="fa-solid fa-check text-emerald-500 mt-1 mr-3"></i> <span><strong>Time Bound:</strong> Access automatically expires after the designated time frame.</span></li>
                  <li className="flex items-start"><i className="fa-solid fa-check text-emerald-500 mt-1 mr-3"></i> <span><strong>Revocable:</strong> You can revoke access at any time from your patient dashboard.</span></li>
                  <li className="flex items-start"><i className="fa-solid fa-check text-emerald-500 mt-1 mr-3"></i> <span><strong>Granular:</strong> You can choose to share lab reports but withhold prescriptions.</span></li>
                </ul>
              </div>
            )}

            {(activeTab === 'terms' || activeTab === 'medical' || activeTab === 'grievance') && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fa-solid fa-file-lines text-2xl text-slate-400"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Document Available</h3>
                <p className="text-slate-500 max-w-md">This policy document is currently being updated to reflect our latest compliance standards. Please check back shortly.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

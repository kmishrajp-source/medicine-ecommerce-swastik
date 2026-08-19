"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BioDataPrivacyDashboard() {
  const [consents, setConsents] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mocking the user ID header for this Swastik MVP
  const mockHeaders = {
    'x-user-id': 'current-user-mock-id'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [consentRes, reportRes] = await Promise.all([
        fetch(`/api/bio/consent`, { headers: mockHeaders }),
        fetch(`/api/bio/reports?role=PATIENT`, { headers: mockHeaders })
      ]);
      
      const consentData = await consentRes.json();
      const reportData = await reportRes.json();
      
      if (consentData.success) setConsents(consentData.consents);
      if (reportData.success) setReports(reportData.reports);
      
    } catch (error) {
      console.error("Failed to load privacy data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (doctorId) => {
    try {
      const res = await fetch(`/api/bio/consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...mockHeaders
        },
        body: JSON.stringify({ doctorId, action: 'REVOKE' })
      });
      const data = await res.json();
      if (data.success) {
        fetchData(); // Refresh list
      }
    } catch (error) {
      console.error("Failed to revoke consent", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/bio" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
            <span className="mr-2">←</span> Back to Bio-Health Hub
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            🛡️ My Bio-Data Privacy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Total control over your genetic data. View your reports and manage which healthcare professionals have access.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Reports Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">📄</span> My Genomic Reports
            </h2>
            {loading ? (
              <div className="text-gray-500">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <p className="text-gray-500">No genomic reports found securely stored.</p>
                <p className="text-sm text-gray-400 mt-2">Any tests you take via Swastik verified labs will appear here automatically.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map(report => (
                  <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">Genetic Analysis Report</h3>
                      <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded">Encrypted</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Issued by: {report.issuedBy || 'Verified Lab'}</p>
                    <p className="text-xs text-gray-400 mb-4">Uploaded: {new Date(report.createdAt).toLocaleDateString()}</p>
                    <div className="flex gap-3">
                      <button className="flex-1 bg-blue-50 text-blue-600 text-sm font-semibold py-2 rounded-lg hover:bg-blue-100 transition">
                        View Report
                      </button>
                      <button className="px-4 bg-gray-50 text-gray-600 text-sm font-semibold py-2 rounded-lg hover:bg-gray-100 transition border border-gray-200">
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Consent Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">🔐</span> Data Access Consent
            </h2>
            {loading ? (
              <div className="text-gray-500">Loading consent rules...</div>
            ) : consents.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <p className="text-gray-500">You haven't shared your genomic data with any professionals yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {consents.map(consent => (
                  <div key={consent.id} className={`bg-white rounded-xl shadow-sm border p-5 ${consent.status === 'REVOKED' ? 'border-gray-200 opacity-75' : 'border-indigo-100'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{consent.doctor?.name || "Verified Doctor"}</h3>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${consent.status === 'GRANTED' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'}`}>
                        {consent.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Purpose: Clinical Review (Genomic)</p>
                    {consent.expiresAt && (
                      <p className="text-xs text-rose-600 mb-4">Expires: {new Date(consent.expiresAt).toLocaleDateString()}</p>
                    )}
                    
                    {consent.status === 'GRANTED' && (
                      <button 
                        onClick={() => handleRevoke(consent.doctorId)}
                        className="w-full bg-rose-50 text-rose-600 text-sm font-semibold py-2 rounded-lg hover:bg-rose-100 transition border border-rose-100"
                      >
                        Revoke Access Now
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-sm text-indigo-900">
              <p className="font-semibold mb-1">Strict Privacy Guarantee</p>
              <p>Swastik does not share your genomic reports with any external organization or doctor without your explicit active consent. Access is logged continuously.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

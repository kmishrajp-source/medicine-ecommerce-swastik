"use client";

import React, { useState, useEffect } from 'react';

export default function B2BCRMDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, we would fetch from a unified /api/admin/b2b-crm
    // For now, we simulate loading the B2B contracts.
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading B2B Partners...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Unified B2B CRM</h1>
            <p className="text-slate-500 mt-1">Manage Pharmacies, Labs, Hospitals, and Research Partners</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow font-medium">
            + New B2B Partner
          </button>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
            <div className="flex space-x-4">
              <input 
                type="text" 
                placeholder="Search partners..." 
                className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="ALL">All Categories</option>
                <option value="PHARMACY">Pharmacies</option>
                <option value="LAB">Genomics & Labs</option>
                <option value="HOSPITAL">Hospitals</option>
                <option value="RESEARCH">Research Institutes</option>
              </select>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wide">
                <th className="p-4 border-b">Organization</th>
                <th className="p-4 border-b">Category</th>
                <th className="p-4 border-b">Contract Type</th>
                <th className="p-4 border-b">Status</th>
                <th className="p-4 border-b text-right">Revenue (YTD)</th>
                <th className="p-4 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Example Static Row */}
              <tr className="border-b hover:bg-gray-50">
                <td className="p-4 font-semibold text-slate-800">
                  Apollo Genomics Lab
                  <div className="text-xs text-gray-400 font-normal">ID: B2B-94821</div>
                </td>
                <td className="p-4 text-gray-600">LAB</td>
                <td className="p-4 text-gray-600">Bioinformatics SaaS Pro</td>
                <td className="p-4">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-1 text-xs font-semibold rounded-full">ACTIVE</span>
                </td>
                <td className="p-4 text-right font-medium">₹145,000</td>
                <td className="p-4">
                  <button className="text-indigo-600 hover:text-indigo-900 font-medium text-sm">View Profile</button>
                </td>
              </tr>
              {/* Example Static Row */}
              <tr className="border-b hover:bg-gray-50">
                <td className="p-4 font-semibold text-slate-800">
                  Global Pharma Research
                  <div className="text-xs text-gray-400 font-normal">ID: B2B-11029</div>
                </td>
                <td className="p-4 text-gray-600">RESEARCH</td>
                <td className="p-4 text-gray-600">Enterprise Intelligence</td>
                <td className="p-4">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-1 text-xs font-semibold rounded-full">ACTIVE</span>
                </td>
                <td className="p-4 text-right font-medium">₹850,000</td>
                <td className="p-4">
                  <button className="text-indigo-600 hover:text-indigo-900 font-medium text-sm">View Profile</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';

export default function CapitalDeploymentDashboard() {
  const [data, setData] = useState({ deployments: [], summary: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/investment');
        const json = await res.json();
        if (json.success) setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Capital Data...</div>;

  const { summary, deployments } = data;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Capital Deployment Board</h1>
          <p className="text-slate-500 mt-1">Tracking the US$3 Million Biotech & AI Investment Plan</p>
        </div>

        {/* Master KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-emerald-500">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Approved Budget</h3>
            <div className="text-3xl font-bold text-gray-900">₹{(summary?.totalApproved || 3000000).toLocaleString()}</div>
            <div className="text-gray-400 text-sm mt-2">Board Authorized Cap</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-amber-500">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Committed Capital</h3>
            <div className="text-3xl font-bold text-gray-900">₹{(summary?.totalCommitted || 0).toLocaleString()}</div>
            <div className="text-gray-400 text-sm mt-2">Contracted & Allocated</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-rose-500">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Spent Capital (Burn)</h3>
            <div className="text-3xl font-bold text-gray-900">₹{(summary?.totalSpent || 0).toLocaleString()}</div>
            <div className="text-gray-400 text-sm mt-2">Actual Cash Deployed</div>
          </div>
        </div>

        {/* Stages */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-6 border-b bg-gray-50">
            <h2 className="text-xl font-bold text-slate-800">Milestone Funding Stages</h2>
          </div>
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wide">
                  <th className="p-4 border-b">Stage</th>
                  <th className="p-4 border-b">Category</th>
                  <th className="p-4 border-b text-right">Approved</th>
                  <th className="p-4 border-b text-right">Spent</th>
                  <th className="p-4 border-b text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {deployments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">No deployments tracked yet. Configure in settings.</td>
                  </tr>
                ) : (
                  deployments.map((dep) => (
                    <tr key={dep.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-semibold text-slate-800">{dep.milestoneStage}</td>
                      <td className="p-4 text-gray-600">{dep.category}</td>
                      <td className="p-4 text-right">₹{dep.approvedBudget.toLocaleString()}</td>
                      <td className="p-4 text-right">₹{dep.spentCapital.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          dep.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          dep.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {dep.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

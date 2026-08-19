"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function RevenueIntelligenceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/revenue/engine');
        const json = await res.json();
        if (json.success) setData(json.aggregated);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const runAIOptimization = async () => {
    alert("Running Revenue AI Optimization... Please check the console for details.");
    try {
      const res = await fetch('/api/admin/revenue/ai-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ANALYZE_REVENUE' })
      });
      const json = await res.json();
      console.log('AI Insights:', json.insights);
      alert('AI Output:\n' + json.insights.aiInsights);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Intelligence...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Revenue Engine Intelligence</h1>
            <p className="text-slate-500 mt-1">Unified view of all Swastik revenue streams (Last 30 Days)</p>
          </div>
          <button 
            onClick={runAIOptimization}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow font-medium flex items-center"
          >
            <i className="fa-solid fa-wand-magic-sparkles mr-2"></i> Run AI Optimizer
          </button>
        </div>

        {/* Master KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-500">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Total Net Revenue</h3>
            <div className="text-3xl font-bold text-gray-900">₹{data?.totalNetRevenue?.toLocaleString() || 0}</div>
            <div className="text-green-500 text-sm mt-2"><i className="fa-solid fa-arrow-trend-up mr-1"></i> Swastik's Take</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-emerald-500">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Gross Margin</h3>
            <div className="text-3xl font-bold text-gray-900">₹{data?.totalGrossMargin?.toLocaleString() || 0}</div>
            <div className="text-green-500 text-sm mt-2"><i className="fa-solid fa-arrow-trend-up mr-1"></i> Post Direct Costs</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Total Customer Spend</h3>
            <div className="text-3xl font-bold text-gray-900">₹{data?.totalCustomerPaid?.toLocaleString() || 0}</div>
            <div className="text-gray-400 text-sm mt-2">Gross Merchandise Value (GMV)</div>
          </div>
        </div>

        {/* Revenue Streams Grid */}
        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">Revenue by Engine</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Pharmacy", icon: "fa-pills", color: "text-blue-500", key: "PHARMACY_ORDER" },
            { name: "Healthcare Services", icon: "fa-user-doctor", color: "text-emerald-500", key: "DOCTOR_CONSULT" },
            { name: "Genomics", icon: "fa-dna", color: "text-purple-500", key: "GENOMICS_TEST" },
            { name: "Bioinformatics", icon: "fa-server", color: "text-indigo-500", key: "BIOINFORMATICS_SAAS" },
            { name: "AI Platform", icon: "fa-brain", color: "text-pink-500", key: "AI_PLATFORM" },
            { name: "Research Intelligence", icon: "fa-microscope", color: "text-amber-500", key: "RESEARCH_INTELLIGENCE" }
          ].map(engine => (
            <div key={engine.name} className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
              <div className="flex items-center mb-4">
                <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center ${engine.color} text-xl`}>
                  <i className={`fa-solid ${engine.icon}`}></i>
                </div>
                <h3 className="ml-3 font-semibold text-gray-800">{engine.name}</h3>
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                ₹{(data?.byType?.[engine.key] || 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Net Revenue</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

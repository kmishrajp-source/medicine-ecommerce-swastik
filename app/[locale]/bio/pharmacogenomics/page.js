"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function PharmacogenomicsModule() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    // In a full implementation this would call an API route wrapping PharmacogenomicsAgent.js
    // For this MVP UI, we simulate the AI processing time.
    setTimeout(() => {
      setResult("Based on established pharmacogenomic guidelines (e.g., CPIC), patients with specific CYP2C19 genotypes may have altered metabolism for this medication. A dosage adjustment or alternative therapy could be considered. This information is for professional review only and does not constitute medical advice.");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link href="/bio" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
            <span className="mr-2">←</span> Back to Bio-Health Hub
          </Link>
        </div>

        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            💊 Pharmacogenomics Information Module
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional Decision Support for medicine-gene interactions.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
              <p className="text-sm text-blue-700 font-semibold">
                WARNING: This tool is for use by qualified healthcare professionals only. It provides evidence-based information for review but does not independently recommend starting or stopping medications.
              </p>
            </div>

            <form onSubmit={handleSearch} className="mb-8">
              <label className="block text-gray-700 font-semibold mb-2">Cross-Reference Medicine and Gene/Biomarker</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., Clopidogrel and CYP2C19..." 
                  className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <button type="submit" className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700">
                  Analyze
                </button>
              </div>
            </form>

            {loading && (
              <div className="flex items-center space-x-2 text-blue-600 font-semibold">
                <div className="w-5 h-5 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                <span>Analyzing scientific literature...</span>
              </div>
            )}

            {result && !loading && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-800 mb-2">AI Scientific Summary</h3>
                <p className="text-gray-700 leading-relaxed">{result}</p>
                <div className="mt-4 text-xs text-gray-500">
                  Source: Pharmacogenomics Knowledge Base (Mocked data for Phase 7 implementation).
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

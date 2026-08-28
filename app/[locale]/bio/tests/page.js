"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function GeneticTestsDiscovery() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async (query = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bio/tests?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setTests(data.tests);
      }
    } catch (error) {
      console.error("Failed to load tests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTests(searchQuery);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/bio" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
            <span className="mr-2">←</span> Back to Bio-Health Hub
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            🧬 Genetic & Molecular Tests
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover verified laboratories offering genetic, molecular, and biomarker testing. 
            <span className="block mt-2 text-sm font-semibold text-rose-600">
              Note: Test suitability depends on your individual circumstances. Always consult a healthcare professional.
            </span>
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Search for tests (e.g., BRCA, Exome, Carrier)..." 
              className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition">
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-2">No genetic tests are currently available for this search.</h3>
            <p className="text-gray-500 text-lg mb-6">Try searching for:</p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
                <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium cursor-pointer hover:bg-blue-100" onClick={() => fetchTests('NGS')}>• NGS</span>
                <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium cursor-pointer hover:bg-blue-100" onClick={() => fetchTests('BRCA')}>• BRCA</span>
                <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium cursor-pointer hover:bg-blue-100" onClick={() => fetchTests('Molecular')}>• Molecular testing</span>
                <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium cursor-pointer hover:bg-blue-100" onClick={() => fetchTests('Genetic screening')}>• Genetic screening</span>
            </div>
            <div className="border-t border-gray-100 pt-6 mt-4">
                <p className="text-gray-600 mb-4">Can't find your test?</p>
                <button className="bg-rose-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-rose-700 transition">
                    Request a Test
                </button>
                <p className="text-sm text-gray-400 mt-2">We'll help you find an appropriate laboratory.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map(test => {
                // Determine lowest price and max turnaround
                let lowestPrice = 0;
                let turnaround = "Varies";
                if (test.offerings && test.offerings.length > 0) {
                    lowestPrice = Math.min(...test.offerings.map(o => o.price));
                    turnaround = test.offerings[0].turnaroundTime || "Varies";
                }
                
                return (
                <div key={test.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                        {test.category}
                      </span>
                      {lowestPrice > 0 && <span className="text-lg font-bold text-gray-900">From ₹{lowestPrice}</span>}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{test.displayName || test.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {test.description || "No specific description available."}
                    </p>
                    
                    <div className="bg-slate-50 p-3 rounded-lg text-sm mb-4">
                      <p className="text-gray-700"><span className="font-semibold">Sample:</span> {test.sampleRequirements || "Verify with lab"}</p>
                      <p className="text-gray-700 mt-1"><span className="font-semibold">Turnaround:</span> {turnaround}</p>
                      <p className="text-gray-700 mt-1"><span className="font-semibold">Labs offering this test:</span> {test.offerings?.length || 0}</p>
                    </div>
                  </div>
                  <div className="p-6 pt-0 mt-auto">
                    <Link href={`/bio/tests/${test.id}`} className="block w-full text-center bg-blue-50 text-blue-600 font-semibold py-2 rounded-lg hover:bg-blue-100 transition border border-blue-100">
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

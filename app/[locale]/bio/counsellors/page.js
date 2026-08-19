"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function GeneticCounsellorsDiscovery() {
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCounsellors();
  }, []);

  const fetchCounsellors = async (query = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bio/counsellors?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setCounsellors(data.counsellors);
      }
    } catch (error) {
      console.error("Failed to load counsellors", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCounsellors(searchQuery);
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
            👨‍⚕️ Genetic Counsellors Directory
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with verified professionals who can help you understand your genetic information, inheritance patterns, and test results.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Search by name, hospital, or city..." 
              className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="bg-rose-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-rose-700 transition">
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
          </div>
        ) : counsellors.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">No genetic counsellors found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {counsellors.map(doc => (
              <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition p-6 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center text-xl font-bold">
                    {doc.name ? doc.name.charAt(0).toUpperCase() : 'D'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{doc.name || "Unknown Doctor"}</h3>
                    <p className="text-sm text-rose-600 font-medium">{doc.specialization}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-6 flex-1">
                  {doc.hospital && (
                    <div className="flex items-start gap-2 text-gray-600 text-sm">
                      <span>🏥</span> <span>{doc.hospital}</span>
                    </div>
                  )}
                  {doc.city && (
                    <div className="flex items-start gap-2 text-gray-600 text-sm">
                      <span>📍</span> <span>{doc.city}</span>
                    </div>
                  )}
                  {doc.experience && (
                    <div className="flex items-start gap-2 text-gray-600 text-sm">
                      <span>🎓</span> <span>{doc.experience} Years Experience</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="text-lg font-bold text-gray-900">
                    ₹{doc.consultationFee}
                  </div>
                  <button className="bg-rose-50 text-rose-600 font-semibold px-4 py-2 rounded-lg hover:bg-rose-100 transition border border-rose-100">
                    Book Consult
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

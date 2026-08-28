"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

export default function GeneticTestDetail() {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTestDetails(id);
    }
  }, [id]);

  const fetchTestDetails = async (testId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bio/tests/${testId}`);
      const data = await res.json();
      if (data.success) {
        setTest(data.test);
      }
    } catch (error) {
      console.error("Failed to load test details", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Not Found</h1>
        <Link href="/bio/tests" className="text-blue-600 font-medium">← Back to Directory</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/bio/tests" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
            <span className="mr-2">←</span> Back to Genetic & Molecular Tests
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
              {test.category}
            </span>
            {test.subcategory && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                {test.subcategory}
              </span>
            )}
            {test.testCode && (
              <span className="px-3 py-1 border border-gray-200 text-gray-400 text-xs font-bold rounded-full">
                Code: {test.testCode}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            {test.displayName || test.name}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            {test.description}
          </p>
          <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-lg">
            <p className="text-rose-700 text-sm font-medium flex gap-2">
              <span className="text-xl">⚠️</span>
              <span>
                <strong>Medical Disclaimer:</strong> This information is for educational purposes. 
                This test should only be considered in consultation with a qualified healthcare professional. 
                Swastik Medicare does not diagnose or recommend treatments based on genetic test results.
              </span>
            </p>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">About This Test</h2>
              
              {test.whatIsIt && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">What is this test?</h3>
                  <div className="text-gray-700 prose"><ReactMarkdown>{test.whatIsIt}</ReactMarkdown></div>
                </div>
              )}
              
              {test.whatDoesItDetect && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">What does it detect?</h3>
                  <div className="text-gray-700 prose"><ReactMarkdown>{test.whatDoesItDetect}</ReactMarkdown></div>
                </div>
              )}

              {test.whyOrdered && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Why might it be ordered?</h3>
                  <div className="text-gray-700 prose"><ReactMarkdown>{test.whyOrdered}</ReactMarkdown></div>
                </div>
              )}

              {test.potentialBenefits && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-green-500">✓</span> Potential Benefits
                  </h3>
                  <div className="text-gray-700 prose"><ReactMarkdown>{test.potentialBenefits}</ReactMarkdown></div>
                </div>
              )}

              {test.resultMeaning && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">What does the result mean?</h3>
                  <div className="text-gray-700 prose"><ReactMarkdown>{test.resultMeaning}</ReactMarkdown></div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Requirements</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Sample Required</h3>
                  <p className="text-gray-900 font-medium">{test.sampleRequirements || "Verify with laboratory"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Preparation</h3>
                  <p className="text-gray-900 font-medium">{test.preparation || "No special preparation required."}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Laboratories & Booking */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Available Laboratories</h2>
            
            {test.offerings && test.offerings.length > 0 ? (
              test.offerings.map(offering => (
                <div key={offering.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
                  {offering.lab?.verified && (
                    <div className="absolute top-0 right-0 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                      VERIFIED LAB
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{offering.lab?.name || "Verified Provider"}</h3>
                  <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">📍 {offering.lab?.city || "Gorakhpur"}</p>
                  
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">Turnaround</p>
                      <p className="font-semibold text-gray-900">{offering.turnaroundTime || "Varies"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase font-bold">Price</p>
                      <p className="font-extrabold text-gray-900 text-xl">₹{offering.price}</p>
                    </div>
                  </div>

                  <Link href={`/book/test/${offering.id}`} className="block w-full text-center bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 shadow-sm transition">
                    Book This Test
                  </Link>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
                <p className="text-gray-500">Currently no laboratories have verified pricing for this test.</p>
                <button className="mt-4 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition w-full">
                  Request Availability
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
      <style jsx global>{`
        .prose p { margin-bottom: 0.5em; }
        .prose p:last-child { margin-bottom: 0; }
        .prose ul { padding-left: 20px; list-style-type: disc; margin-bottom: 0.5em; }
      `}</style>
    </div>
  );
}

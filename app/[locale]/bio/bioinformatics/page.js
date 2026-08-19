"use client";

import React from 'react';
import Link from 'next/link';

export default function BioinformaticsHub() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link href="/bio" className="text-emerald-600 hover:text-emerald-800 font-medium flex items-center">
            <span className="mr-2">←</span> Back to Bio-Health Hub
          </Link>
        </div>

        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            💻 Swastik Bioinformatics Engine
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A future-ready computational biology layer for processing laboratory data, genomic datasets, and molecular diagnostic reports.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-emerald-100 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-center h-48 bg-slate-100 rounded-lg border-2 border-dashed border-gray-300 mb-6">
              <div className="text-center">
                <p className="text-gray-500 mb-2">Secure Dataset Upload (e.g., FASTQ, BAM, VCF)</p>
                <button className="bg-gray-300 text-gray-500 cursor-not-allowed font-semibold py-2 px-6 rounded-lg">
                  Authorization Required
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-4">Architecture Preview (Phase 6)</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start"><span className="text-emerald-500 mr-2">✓</span> <strong>Data Ingestion:</strong> Secure endpoints for large genomic payloads.</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-2">✓</span> <strong>Data Normalization:</strong> Standardizing genetic data formats for AI processing.</li>
              <li className="flex items-start"><span className="text-emerald-500 mr-2">✓</span> <strong>Privacy-First:</strong> Strict adherence to consent models implemented in Phase 5.</li>
            </ul>

            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <strong className="block mb-1">Status: Restricted Access</strong>
              This module requires specialized computational infrastructure and explicit institutional authorization. It is currently operating in limited preview mode.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

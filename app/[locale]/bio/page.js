"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function BioHealthHub() {
  const t = useTranslations('Index'); // Fallback translations

  const [searchQuery, setSearchQuery] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/speech/recognize-audio', { // Reusing our voice/text endpoint logic if we want, but better to hit an LLM endpoint. Wait, we don't have a direct text API endpoint yet.
        // I will just mock the AI response for the UI preview or use the general Swastik Voice Assistant widget which handles everything.
      });
      // For now, let's just show a simulated loading since the Voice widget handles AI directly.
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 mb-4 tracking-tight">
            🧬 Swastik Bio-Health & Research
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-medium">
            Discover the future of precision medicine. Explore biotechnology, genomics, genetic testing, and the latest biomedical research in simple language.
          </p>
        </div>

        {/* AI Assistant Search Bar */}
        <div className="max-w-3xl mx-auto mb-16 relative">
          <div className="absolute inset-0 bg-blue-200 rounded-full blur-md opacity-50"></div>
          <form onSubmit={(e) => { e.preventDefault(); /* Hook to global voice/AI widget */ }} className="relative bg-white rounded-full shadow-lg p-2 flex items-center border border-blue-100 hover:border-blue-300 transition-colors">
            <div className="p-3 text-blue-500 bg-blue-50 rounded-full ml-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input 
              type="text" 
              placeholder="Ask about genomics, CRISPR, or recent cancer research..." 
              className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 px-4 text-lg outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
              Ask AI
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            Try: "What is Whole Exome Sequencing?" or "New research on Diabetes"
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-xl transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
            <div className="text-4xl mb-4 relative">🧬</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 relative">Genomics Education</h3>
            <p className="text-gray-600 mb-6 relative">Learn about DNA, genes, sequencing, and how precision medicine works in simple terms.</p>
            <Link href="/bio/bioinformatics" className="inline-block text-blue-600 font-semibold hover:text-blue-800 flex items-center group-hover:gap-2 transition-all">
              Start Learning <span className="ml-1">→</span>
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-xl transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
            <div className="text-4xl mb-4 relative">🔬</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 relative">Biomedical Research</h3>
            <p className="text-gray-600 mb-6 relative">Explore verified summaries of the latest scientific papers, clinical trials, and discoveries.</p>
            <Link href="/bio/pharmacogenomics" className="inline-block text-emerald-600 font-semibold hover:text-emerald-800 flex items-center group-hover:gap-2 transition-all">
              Browse Research <span className="ml-1">→</span>
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-xl transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
            <div className="text-4xl mb-4 relative">🧪</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 relative">Genetic Tests</h3>
            <p className="text-gray-600 mb-6 relative">Discover what molecular diagnostics investigate and find verified labs offering these services.</p>
            <Link href="/bio/tests" className="inline-block text-purple-600 font-semibold hover:text-purple-800 flex items-center group-hover:gap-2 transition-all">
              Find Tests <span className="ml-1">→</span>
            </Link>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-xl transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
            <div className="text-4xl mb-4 relative">🔔</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 relative">Research Alerts</h3>
            <p className="text-gray-600 mb-6 relative">Subscribe to AI-summarized alerts on specific health topics, diseases, or biotechnology trends.</p>
            <Link href="/profile" className="inline-block text-amber-600 font-semibold hover:text-amber-800 flex items-center group-hover:gap-2 transition-all">
              Manage Alerts <span className="ml-1">→</span>
            </Link>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-xl transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
            <div className="text-4xl mb-4 relative">👨‍⚕️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 relative">Genetic Counselling</h3>
            <p className="text-gray-600 mb-6 relative">Connect with verified professionals who can help you understand your genetic information.</p>
            <Link href="/bio/counsellors" className="inline-block text-rose-600 font-semibold hover:text-rose-800 flex items-center group-hover:gap-2 transition-all">
              Find Counsellors <span className="ml-1">→</span>
            </Link>
          </div>

          {/* Card 6 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-xl transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
            <div className="text-4xl mb-4 relative">🛡️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 relative">Bio-Data Privacy</h3>
            <p className="text-gray-600 mb-6 relative">Control who accesses your genomic reports. Strict consent management for peace of mind.</p>
            <Link href="/bio/privacy" className="inline-block text-indigo-600 font-semibold hover:text-indigo-800 flex items-center group-hover:gap-2 transition-all">
              Privacy Settings <span className="ml-1">→</span>
            </Link>
          </div>

        </div>

        {/* Disclaimer */}
        <div className="mt-16 bg-blue-50 border border-blue-100 rounded-xl p-6 text-sm text-slate-600">
          <p className="font-semibold text-slate-800 mb-2">Important Medical Disclaimer</p>
          <p>
            Swastik Bio-Health is an information and discovery platform. The AI and educational materials provided do not constitute medical advice, nor do they diagnose disease or predict future health outcomes. Always consult a qualified healthcare professional or genetic counsellor before making medical decisions based on genomic information. We do not share your genetic data without explicit authorization.
          </p>
        </div>

      </div>
    </div>
  );
}

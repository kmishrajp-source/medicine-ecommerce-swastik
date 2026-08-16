'use client';
import { useState } from 'react';
import axios from 'axios';

export default function UnifiedHealthcareSearch({ userId }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post('/api/healthcare-intelligence/search', { query, userId });
      setResult(res.data);
    } catch (error) {
      console.error("Search failed:", error);
      setResult({ error: "Failed to process request. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 font-sans">
      
      {/* Search Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">How can we help you?</h1>
        <p className="text-slate-500">Search for medicines, hospitals, lab tests, ambulances, or insurance.</p>
      </div>

      {/* Emergency Button */}
      <div className="flex justify-center mb-8">
        <button 
          onClick={() => setQuery("I need an emergency ambulance")}
          className="bg-red-50 text-red-600 font-bold px-6 py-2 rounded-full border border-red-100 hover:bg-red-100 transition-colors flex items-center gap-2"
        >
          <i className="fa-solid fa-truck-medical"></i> Emergency Assist
        </button>
      </div>

      {/* Search Box */}
      <form onSubmit={handleSearch} className="relative shadow-lg rounded-2xl overflow-hidden border border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50 transition-all bg-white flex">
        <div className="pl-6 flex items-center text-slate-400">
          <i className="fa-solid fa-sparkles"></i>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., 'Find generic alternative for Glycomet' or 'Book a CBC lab test'"
          className="w-full px-4 py-5 outline-none text-slate-700 bg-transparent"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-5 transition-colors disabled:opacity-50"
        >
          {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Search"}
        </button>
      </form>

      {/* Results Container */}
      {result && (
        <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
          
          <div className="mb-4">
            <span className="inline-block bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">
              {result.intent?.replace('_', ' ')}
            </span>
          </div>

          {result.error && <p className="text-red-500 font-medium">{result.error}</p>}
          
          {result.result?.found === false && (
            <p className="text-slate-600">{result.result.message}</p>
          )}

          {/* Render Agent Result Data (Simplified) */}
          {result.result?.found && (
            <div className="space-y-4">
              
              {/* Disclaimers */}
              {result.result.safetyDisclaimer && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm font-medium flex gap-3">
                  <i className="fa-solid fa-triangle-exclamation mt-0.5 text-amber-500"></i>
                  {result.result.safetyDisclaimer}
                </div>
              )}
              {result.result.disclaimer && (
                <div className="bg-slate-50 border border-slate-200 text-slate-600 p-4 rounded-xl text-sm">
                  {result.result.disclaimer}
                </div>
              )}

              {/* Data Presentation (Dynamic based on Intent) */}
              <pre className="bg-slate-900 text-green-400 p-4 rounded-xl overflow-x-auto text-xs font-mono">
                {JSON.stringify(result.result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Suggestion Chips */}
      {!result && !loading && (
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {["Hospitals near me with Cardiology", "Generic alternative for Paracetamol", "Cashless network check", "Home collection lab test"].map(suggestion => (
            <button 
              key={suggestion}
              onClick={() => setQuery(suggestion)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm px-4 py-2 rounded-full transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

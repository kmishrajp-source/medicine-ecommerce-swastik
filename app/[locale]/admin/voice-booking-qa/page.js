'use client';
import { useState } from 'react';

export default function VoiceBookingQA() {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);

  const testVoiceBooking = async (transcript) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/speech/recognize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Mode': 'true'
        },
        body: JSON.stringify({
          transcript: transcript,
          detectedLang: 'en-IN',
          userId: 'test-admin-123'
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  const handleTestRun = () => {
    if (query) testVoiceBooking(query);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Booking Health Dashboard (QA)</h1>
          <p className="text-gray-500">Test voice booking intents in an isolated dummy environment.</p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-100 mb-6">
        <h3 className="font-semibold text-lg mb-2">Test Console (Real vs Test Environment Protected)</h3>
        <p className="text-sm text-gray-700 mb-4">
          Requests sent from this console have the <code>X-Test-Mode</code> header attached. 
          No real bookings or payments will be processed.
        </p>
        <div className="flex gap-4">
          <input 
            type="text"
            placeholder="e.g., 'Book a lung doctor tomorrow. Yes book it.'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTestRun()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            disabled={loading} 
            onClick={handleTestRun}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Running...' : 'Run Test'}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-lg mb-4">Execution Trace</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-4 border-b pb-2">
              <span className="text-gray-500 font-medium col-span-1">STATUS</span>
              <span className="col-span-3">
                {result.success ? (
                  <span className="text-green-600 font-semibold">SUCCESS</span>
                ) : (
                  <span className="text-red-600 font-semibold">FAILED</span>
                )}
              </span>
            </div>
            <div className="grid grid-cols-4 border-b pb-2">
              <span className="text-gray-500 font-medium col-span-1">INTENT</span>
              <span className="col-span-3 font-mono">{result.intent}</span>
            </div>
            <div className="grid grid-cols-4 border-b pb-2">
              <span className="text-gray-500 font-medium col-span-1">ENVIRONMENT</span>
              <span className="col-span-3">
                 <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs font-bold">TEST MODE (DUMMY)</span>
              </span>
            </div>
            <div className="grid grid-cols-4 border-b pb-2">
              <span className="text-gray-500 font-medium col-span-1">EXTRACTED MSG</span>
              <span className="col-span-3 text-gray-700 whitespace-pre-wrap">{result.data?.message}</span>
            </div>
            <div className="grid grid-cols-4">
              <span className="text-gray-500 font-medium col-span-1">DATA / BOOKING</span>
              <span className="col-span-3">
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useState } from 'react';
import { Button, Card, CardBody, Input } from '@nextui-org/react';

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Booking Health Dashboard (QA)</h1>
          <p className="text-default-500">Test voice booking intents in an isolated dummy environment.</p>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-none">
        <CardBody className="gap-4">
          <h3 className="font-semibold text-lg">Test Console (Real vs Test Environment Protected)</h3>
          <p className="text-sm">
            Requests sent from this console have the <code>X-Test-Mode</code> header attached. 
            No real bookings or payments will be processed.
          </p>
          <div className="flex gap-4">
            <Input 
              placeholder="e.g., 'Book a lung doctor tomorrow. Yes book it.'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTestRun()}
              className="flex-1"
            />
            <Button color="primary" isLoading={loading} onClick={handleTestRun}>
              Run Test
            </Button>
          </div>
        </CardBody>
      </Card>

      {result && (
        <Card>
          <CardBody>
            <h3 className="font-semibold text-lg mb-4">Execution Trace</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-4 border-b pb-2">
                <span className="text-default-500 font-medium col-span-1">STATUS</span>
                <span className="col-span-3">
                  {result.success ? (
                    <span className="text-success font-semibold">SUCCESS</span>
                  ) : (
                    <span className="text-danger font-semibold">FAILED</span>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-4 border-b pb-2">
                <span className="text-default-500 font-medium col-span-1">INTENT</span>
                <span className="col-span-3 font-mono">{result.intent}</span>
              </div>
              <div className="grid grid-cols-4 border-b pb-2">
                <span className="text-default-500 font-medium col-span-1">ENVIRONMENT</span>
                <span className="col-span-3">
                   <span className="bg-warning-100 text-warning-800 px-2 py-1 rounded-md text-xs font-bold">TEST MODE (DUMMY)</span>
                </span>
              </div>
              <div className="grid grid-cols-4 border-b pb-2">
                <span className="text-default-500 font-medium col-span-1">EXTRACTED MSG</span>
                <span className="col-span-3 text-default-700 whitespace-pre-wrap">{result.data?.message}</span>
              </div>
              <div className="grid grid-cols-4">
                <span className="text-default-500 font-medium col-span-1">DATA / BOOKING</span>
                <span className="col-span-3">
                  <pre className="bg-default-100 p-4 rounded-lg text-sm overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

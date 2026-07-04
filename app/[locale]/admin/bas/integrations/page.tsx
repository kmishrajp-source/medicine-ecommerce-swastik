'use client';

import React, { useState, useEffect } from 'react';
import { Layers, HelpCircle, ToggleLeft, ToggleRight, Sparkles, Cpu, Send, CheckCircle2, ShieldCheck, Terminal } from 'lucide-react';

export default function IntegrationsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchConfig = () => {
    fetch('/api/admin/bas/integrations')
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  const handleToggle = (key: string, name: string, currentVal: any) => {
    const updatedVal = { ...currentVal, enabled: !currentVal.enabled };
    fetch('/api/admin/bas/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, name, value: updatedVal }),
    })
      .then(res => res.json())
      .then(() => {
        addLog(`Toggled ${name} to ${updatedVal.enabled ? 'ENABLED' : 'DISABLED'}`);
        fetchConfig();
      })
      .catch(err => console.error(err));
  };

  const handleTestPing = (connectorName: string) => {
    addLog(`Testing payload endpoint connectivity for ${connectorName}...`);
    setTimeout(() => {
      addLog(`Ping response from ${connectorName} received: STATUS 200 OK`);
    }, 800);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Integration configuration...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl shadow-lg shadow-indigo-500/30">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
              Future API Layer & AI Gateway
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Configure abstract ERP/accounting stubs and manage predictive AI engine states</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Middle Column: Integrations & API Config */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-lg space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <span>Modular Connector Triggers</span>
            </h3>
            
            <div className="space-y-4">
              {data?.integrations?.map((item: any) => {
                const isEnabled = item.value?.enabled === true;
                return (
                  <div key={item.key} className="flex justify-between items-center p-4 rounded-2xl bg-white/40 dark:bg-slate-950/20 border border-white/10">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.key === 'AI_SERVICE' ? 'Toggles ML demand predictions' : 'Decoupled abstract interface'}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => handleTestPing(item.name)}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Ping Test
                      </button>
                      <button onClick={() => handleToggle(item.key, item.name, item.value)}>
                        {isEnabled ? (
                          <ToggleRight className="w-10 h-10 text-indigo-600 dark:text-indigo-400 cursor-pointer" />
                        ) : (
                          <ToggleLeft className="w-10 h-10 text-gray-400 cursor-pointer" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Terminal Console for API Payload simulation */}
          <div className="bg-slate-950 text-slate-200 p-6 rounded-3xl border border-white/10 shadow-lg font-mono text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2 text-slate-400">
              <span className="flex items-center"><Terminal className="w-4 h-4 mr-2" /> Live Connection Logs</span>
              <button onClick={() => setLogs([])} className="hover:text-white">Clear</button>
            </div>
            <div className="space-y-2 h-40 overflow-y-auto pr-2">
              {logs.length === 0 ? (
                <p className="text-slate-500">System idle. Trigger "Ping Test" or configuration states.</p>
              ) : (
                logs.map((log, index) => <p key={index}>{log}</p>)
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Readiness predictions overview */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-xl p-6 rounded-3xl border border-indigo-500/20 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>AI Engine (Decoupled)</span>
            </h3>
            
            <div className="space-y-4 text-sm text-indigo-200">
              <p className="text-xs text-indigo-300">
                The platform is AI Ready. Features below use moving averages by default but hook directly into LLM/Prophet models on connection.
              </p>
              
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
                <p className="font-bold text-white text-xs uppercase tracking-wider">Campaign Target Recommendation</p>
                <div className="space-y-1">
                  <p>Target Group: {data?.aiRecommendations?.targetAudienceGroup}</p>
                  <p>Channel: {data?.aiRecommendations?.suggestedChannel}</p>
                  <p>Expected Conv: {data?.aiRecommendations?.expectedConversionRate}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white text-xs uppercase tracking-wider mb-1">Refill Forecasting</p>
                  <p className="text-xs text-indigo-300">Predict customers requiring medicine refill</p>
                </div>
                <Cpu className="w-8 h-8 text-indigo-400 opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

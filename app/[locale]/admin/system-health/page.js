"use client";

import { useState, useEffect } from "react";
import { Activity, AlertTriangle, CheckCircle, RefreshCw, ServerCrash, XCircle } from "lucide-react";

export default function SystemHealthDashboard() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ totalUnresolved: 0, totalCritical: 0 });
  const [loading, setLoading] = useState(true);

  const fetchHealthLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/system-health");
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch system health:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHealthLogs();
    
    // Auto-refresh every 30 seconds for live monitoring
    const interval = setInterval(fetchHealthLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "CRITICAL":
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1 font-bold"><ServerCrash className="w-3 h-3" /> Critical</span>;
      case "WARNING":
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full flex items-center gap-1 font-medium"><AlertTriangle className="w-3 h-3" /> Warning</span>;
      default:
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1 font-medium"><Activity className="w-3 h-3" /> Info</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="text-blue-600" />
            System Health Monitoring
          </h1>
          <p className="text-gray-500 mt-1">Live tracking of platform errors and auto-fix resolutions.</p>
        </div>
        <button 
          onClick={fetchHealthLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-500" : ""}`} />
          {loading ? "Checking..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 border border-red-100 p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-lg text-red-600">
            <ServerCrash className="w-8 h-8" />
          </div>
          <div>
            <p className="text-red-900 text-sm font-semibold">Critical Offline Issues</p>
            <h2 className="text-3xl font-bold text-red-700">{stats.totalCritical}</h2>
          </div>
        </div>
        
        <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-orange-900 text-sm font-semibold">Unresolved Warnings</p>
            <h2 className="text-3xl font-bold text-orange-700">{stats.totalUnresolved}</h2>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">Recent Incident Logs</h2>
          <span className="text-xs text-gray-500">Auto-refreshes 30s</span>
        </div>
        
        {logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-green-400 mb-3" />
            <p className="text-lg font-medium text-gray-700">All Systems Operational</p>
            <p className="text-sm">No recent incidents detected in the platform.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row gap-4 justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {getSeverityBadge(log.severity)}
                    <span className="text-sm font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {log.component}
                    </span>
                    <span className="text-sm font-medium text-gray-600 border-l border-gray-300 pl-3">
                      {log.issueType}
                    </span>
                  </div>
                  
                  <p className="text-gray-900 text-base">{log.message}</p>
                  
                  {log.isAutoFixed && (
                    <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 p-2 rounded border border-green-100 inline-block w-fit mt-2">
                      <CheckCircle className="w-4 h-4 mt-0.5" />
                      <div>
                        <strong>Auto-Fixed:</strong> {log.autoFixDetails}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400">
                    Logged: {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex sm:flex-col items-center sm:items-end justify-center gap-2">
                  {log.resolvedAt ? (
                    <span className="flex items-center gap-1 text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4" /> Resolved
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full">
                      <XCircle className="w-4 h-4" /> Unresolved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

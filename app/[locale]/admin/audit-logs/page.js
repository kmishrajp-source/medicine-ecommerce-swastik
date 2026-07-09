'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Clock, Search, Filter, ChevronDown, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logType, setLogType] = useState('AUDIT'); // AUDIT or SYSTEM
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit-logs?type=${logType}`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, [logType]);

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (l.action || l.feature || '').toLowerCase().includes(q) ||
      (l.entityType || '').toLowerCase().includes(q) ||
      (l.user?.name || '').toLowerCase().includes(q) ||
      (l.level || '').toLowerCase().includes(q)
    );
  });

  const getLevelStyle = (level) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
      case 'AUDIT_FAILURE': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'ERROR': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              Audit Logs
            </h1>
            <p className="text-gray-500 mt-1">Complete history of staff actions and system events for compliance and investigation.</p>
          </div>
          <button onClick={fetchLogs} className="p-2 border rounded-lg hover:bg-gray-100 text-gray-500">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs + Search */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="flex items-center justify-between p-4 border-b gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setLogType('AUDIT')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${logType === 'AUDIT' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                RBAC Audit Logs
              </button>
              <button
                onClick={() => setLogType('SYSTEM')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${logType === 'SYSTEM' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                System Logs
              </button>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text" placeholder="Search actions, users, entities..."
                className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-72"
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Log count */}
          <div className="px-4 py-2 bg-gray-50 border-b text-xs text-gray-500">
            Showing {filtered.length} of {logs.length} entries (last 200 records)
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading logs...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-gray-500 border-2 border-dashed m-4 rounded-xl">
                No log entries found. Actions taken by staff will appear here.
              </div>
            ) : logType === 'AUDIT' ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Timestamp</th>
                    <th className="px-4 py-3 font-medium text-gray-500">User</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Action</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Entity</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Entity ID</th>
                    <th className="px-4 py-3 font-medium text-gray-500">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{log.user?.name || 'System'}</div>
                        <div className="text-xs text-gray-400">{log.user?.role}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-800">{log.action}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{log.entityType || '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{log.entityId ? log.entityId.slice(-10) + '...' : '-'}</td>
                      <td className="px-4 py-3 text-gray-500">{log.ipAddress || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-500 whitespace-nowrap">Timestamp</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Level</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Feature</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getLevelStyle(log.level)}`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{log.feature}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-md truncate">{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

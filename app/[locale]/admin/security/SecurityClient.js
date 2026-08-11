'use client';

import React from 'react';

export default function SecurityClient() {
  const auditLogs = [
    { id: '1', time: '10 mins ago', user: 'Admin (cuid...)', action: 'CONSENT_OVERRIDE_ATTEMPT', resource: 'PATIENT_RECORD', severity: 'CRITICAL', status: 'BLOCKED' },
    { id: '2', time: '1 hour ago', user: 'Dr. Sharma', action: 'VIEW_LAB_REPORT', resource: 'LAB_REPORT', severity: 'INFO', status: 'SUCCESS' },
    { id: '3', time: '2 hours ago', user: 'Unknown IP (103.x.x.x)', action: 'MULTIPLE_LOGIN_FAILURES', resource: 'ADMIN_DASHBOARD', severity: 'WARNING', status: 'ALERT' },
    { id: '4', time: '5 hours ago', user: 'Pharmacy (City Meds)', action: 'DISPENSE_PRESCRIPTION', resource: 'PRESCRIPTION', severity: 'INFO', status: 'SUCCESS' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Security & Audit Framework</h1>
          <p className="text-sm text-slate-500">Immutable audit logs of all health record access and system events.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50">
            <i className="fa-solid fa-download mr-2"></i> Export Logs
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-500/30">
            <i className="fa-solid fa-shield-halved mr-2"></i> Security Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Access Events (24h)</div>
          <div className="text-3xl font-black text-slate-900">14,203</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm">
          <div className="text-rose-500 text-xs font-bold uppercase tracking-wider mb-2">Critical Alerts</div>
          <div className="text-3xl font-black text-rose-600">3</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Failed Logins (24h)</div>
          <div className="text-3xl font-black text-slate-900">84</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Consent Grants</div>
          <div className="text-3xl font-black text-slate-900">1,402</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Recent Audit Logs</h2>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="pb-3 px-4">Time</th>
                <th className="pb-3 px-4">User / Actor</th>
                <th className="pb-3 px-4">Action</th>
                <th className="pb-3 px-4">Resource</th>
                <th className="pb-3 px-4">Severity</th>
                <th className="pb-3 px-4">Result</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500">{log.time}</td>
                  <td className="py-3 px-4 font-semibold">{log.user}</td>
                  <td className="py-3 px-4 font-mono text-xs">{log.action}</td>
                  <td className="py-3 px-4">{log.resource}</td>
                  <td className="py-3 px-4">
                    {log.severity === 'CRITICAL' && <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-[10px] font-bold">CRITICAL</span>}
                    {log.severity === 'WARNING' && <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold">WARNING</span>}
                    {log.severity === 'INFO' && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold">INFO</span>}
                  </td>
                  <td className="py-3 px-4">
                    {log.status === 'BLOCKED' && <span className="text-rose-600 font-bold text-xs"><i className="fa-solid fa-ban mr-1"></i> BLOCKED</span>}
                    {log.status === 'SUCCESS' && <span className="text-emerald-600 font-bold text-xs"><i className="fa-solid fa-check mr-1"></i> SUCCESS</span>}
                    {log.status === 'ALERT' && <span className="text-amber-600 font-bold text-xs"><i className="fa-solid fa-triangle-exclamation mr-1"></i> ALERTED</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

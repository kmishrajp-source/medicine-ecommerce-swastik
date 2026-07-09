'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Download, TrendingUp, Users, 
  Briefcase, CheckSquare, AlertCircle, Phone
} from 'lucide-react';

const CRMAnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('Overview');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/bas/crm/analytics');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExport = () => {
    // In a real app, this would generate a PDF or CSV using a library or API.
    // For now, we simulate a file download alert.
    alert(`Generating ${reportType} Report as CSV/PDF. Please check your downloads folder shortly.`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            CRM Analytics & Reports
          </h1>
          <p className="text-gray-500 mt-1">Real-time performance metrics across sales, support, and marketing.</p>
        </div>
        <div className="flex gap-2">
          <select 
            className="border rounded-lg px-4 py-2 bg-white text-gray-700 outline-none"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option>Overview</option>
            <option>Sales Performance</option>
            <option>Customer Retention</option>
            <option>Task & Support SLA</option>
          </select>
          <button 
            onClick={handleExport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl"></div>)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* KPI Cards */}
            <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Pipeline Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900">₹{(stats?.revenue?.closedWon || 0).toLocaleString()}</h3>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> Won from {stats?.revenue?.wonCount || 0} Leads
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Avg Lifetime Value</p>
                <h3 className="text-2xl font-bold text-gray-900">₹{Math.round(stats?.customers?.avgLTV || 0).toLocaleString()}</h3>
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">Across all users</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Open Support Tickets</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats?.support?.openTickets || 0}</h3>
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">Needs immediate attention</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Tasks Completed</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats?.tasks?.completedThisMonth || 0}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">This month. ({stats?.tasks?.pending} pending)</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <CheckSquare className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white border rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Customer Classification Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(stats?.classifications || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-gray-600">{key}</span>
                    <div className="flex items-center gap-3 w-1/2">
                      <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((value / 50) * 100, 100)}%` }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{value}</span>
                    </div>
                  </div>
                ))}
                {Object.keys(stats?.classifications || {}).length === 0 && (
                  <div className="text-gray-500 text-sm">No classification data available.</div>
                )}
              </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Sales Activity</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">New Leads (This Month)</span>
                    <span className="font-semibold">{stats?.leads?.newThisMonth || 0}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full w-3/4"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Pipeline Conversion Rate</span>
                    <span className="font-semibold text-amber-600">
                      {stats?.leads?.total > 0 ? Math.round(((stats?.revenue?.wonCount || 0) / stats.leads.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CRMAnalyticsDashboard;

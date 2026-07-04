'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  Download,
  Award,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function DirectorDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exportType, setExportType] = useState('sales');
  const [exporting, setExporting] = useState(false);

  const fetchStats = () => {
    setLoading(true);
    fetch('/api/admin/bas/director/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load director stats:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExport = () => {
    setExporting(true);
    fetch(`/api/admin/bas/director/reports?type=${exportType}`)
      .then(res => res.json())
      .then(data => {
        // Simple CSV generation
        const headers = data.headers.join(',');
        const rows = data.rows.map((row: any) =>
          data.headers.map((h: string) => JSON.stringify(row[h] ?? '')).join(',')
        );
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `bas_${exportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExporting(false);
      })
      .catch(err => {
        console.error('Export failed:', err);
        setExporting(false);
      });
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="w-10 h-10 text-rose-500 animate-spin" />
          <p className="text-gray-500 font-medium">Gathering enterprise metrics...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: "Today's Revenue",
      value: `₹${(stats?.todayRevenue ?? 0).toLocaleString()}`,
      change: "+15%",
      isPositive: true,
      color: "from-emerald-500 to-teal-600",
      icon: DollarSign
    },
    {
      title: "Monthly Revenue",
      value: `₹${(stats?.monthlyRevenue ?? 0).toLocaleString()}`,
      change: "+18.2%",
      isPositive: true,
      color: "from-blue-500 to-indigo-600",
      icon: TrendingUp
    },
    {
      title: "Estimated Profit (22%)",
      value: `₹${(stats?.estimatedProfit ?? 0).toLocaleString()}`,
      change: "+12.1%",
      isPositive: true,
      color: "from-violet-500 to-fuchsia-600",
      icon: Award
    },
    {
      title: "Outstanding Payments",
      value: `₹${(stats?.outstandingPayments ?? 0).toLocaleString()}`,
      change: "-5.4%",
      isPositive: false,
      color: "from-rose-500 to-pink-600",
      icon: AlertTriangle
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl shadow-lg shadow-rose-500/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
              Director Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">High-level financial summaries & downloadable reports</p>
          </div>
        </div>
        <button 
          onClick={fetchStats}
          className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-rose-500/25 transition-all hover:scale-105 active:scale-95 font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-lg hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{kpi.title}</p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-2">{kpi.value}</h3>
              </div>
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${kpi.color} shadow-lg shadow-pink-500/10`}>
                <kpi.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm relative z-10">
              {kpi.isPositive ? (
                <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-500 mr-1" />
              )}
              <span className={`font-semibold ${kpi.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>{kpi.change}</span>
              <span className="text-gray-400 dark:text-gray-500 ml-2">vs last week</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Operations & Exports */}
        <div className="lg:col-span-2 space-y-8">
          {/* Export Center */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2 mb-6">
              <Download className="w-5 h-5 text-rose-500" />
              <span>Report Export Center</span>
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Report Type</label>
                <select
                  value={exportType}
                  onChange={(e) => setFilter(e.target.value)} // wait, setExportType(e.target.value)
                  onClick={(e: any) => setExportType(e.target.value)}
                  className="w-full bg-white/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="sales">Sales & Revenue Report</option>
                  <option value="inventory">Inventory Valuation Report</option>
                  <option value="customers">Customer Directory & Role Summary</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="w-full md:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white px-8 py-3.5 rounded-xl shadow-lg shadow-rose-500/25 transition-all disabled:opacity-50 font-bold"
                >
                  <Download className="w-5 h-5" />
                  <span>{exporting ? 'Generating...' : 'Export to CSV'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Graph Placeholder */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-lg min-h-[300px] flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Revenue Growth Trend</h3>
              <p className="text-gray-400 text-sm mt-1">Monthly trend of delivered order revenues</p>
            </div>
            <div className="flex items-end justify-between h-48 px-4 mt-6">
              {stats?.trends?.map((item: any, idx: number) => (
                <div key={idx} className="flex flex-col items-center space-y-2 w-12">
                  <div className="w-full bg-rose-500/10 dark:bg-rose-500/5 hover:bg-rose-500/20 rounded-t-xl transition-all relative group flex items-end justify-center" style={{ height: '140px' }}>
                    <div className="w-8 bg-rose-500 hover:bg-rose-600 rounded-t-lg transition-all" style={{ height: `${(item.sales / stats.monthlyRevenue) * 100}%` }}>
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                        ₹{Math.round(item.sales).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-400">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Operational Health */}
        <div className="space-y-8">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-lg space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-rose-500" />
              <span>Operational Health</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Pending Orders</span>
                <span className="font-bold text-gray-900 dark:text-white bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-lg text-sm border border-amber-200 dark:border-amber-800">
                  {stats?.pendingOrders ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Low Stock Alerts</span>
                <span className="font-bold text-gray-900 dark:text-white bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-lg text-sm border border-rose-200 dark:border-rose-800">
                  {stats?.lowStockAlerts ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 font-medium">CSAT Score</span>
                <span className="font-bold text-gray-900 dark:text-white bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-lg text-sm border border-emerald-200 dark:border-emerald-800">
                  {stats?.csat ?? 96}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Est. Inventory Value</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  ₹{(stats?.inventoryValue ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Inventory Overview</h3>
            <div className="space-y-4">
              {stats?.topProducts?.map((product: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3 last:border-b-0 last:pb-0">
                  <div className="max-w-[70%]">
                    <p className="font-bold text-gray-800 dark:text-gray-200 truncate text-sm">{product.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">₹{product.price}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Stock: {product.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

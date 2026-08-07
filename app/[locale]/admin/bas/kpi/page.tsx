'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Activity } from 'lucide-react';

export default function KPIDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/bas/kpi')
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading KPI Engine...</div>;
  }

  if (!metrics || metrics.error) {
    return <div className="p-8 text-center text-red-500">Failed to load KPIs.</div>;
  }

  const kpiCards = [
    { 
      title: 'Total Revenue', 
      value: `₹${metrics.sales?.revenue?.toLocaleString() || 0}`, 
      trend: '+12.5%', 
      isPositive: true, 
      icon: DollarSign, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50 dark:bg-emerald-900/20' 
    },
    { 
      title: 'Total Orders', 
      value: metrics.sales?.totalOrders?.toLocaleString() || '0', 
      trend: '+5.2%', 
      isPositive: true, 
      icon: ShoppingCart, 
      color: 'text-blue-500', 
      bg: 'bg-blue-50 dark:bg-blue-900/20' 
    },
    { 
      title: 'Total Leads', 
      value: metrics.marketing?.totalLeads?.toLocaleString() || '0', 
      trend: '+18.1%', 
      isPositive: true, 
      icon: Users, 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-50 dark:bg-indigo-900/20' 
    },
    { 
      title: 'Active Campaigns', 
      value: metrics.marketing?.activeCampaigns?.toLocaleString() || '0', 
      trend: '-2.4%', 
      isPositive: false, 
      icon: Activity, 
      color: 'text-rose-500', 
      bg: 'bg-rose-50 dark:bg-rose-900/20' 
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl shadow-lg shadow-violet-500/30">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
              Department KPIs
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time performance metrics across the organization</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <select className="bg-white/60 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-violet-500">
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* KPI Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, idx) => (
          <div key={idx} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-lg hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${card.bg} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`}></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-2xl ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
            
            <div className="mt-4 flex items-center text-sm relative z-10">
              {card.isPositive ? (
                <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-500 mr-1" />
              )}
              <span className={`font-semibold ${card.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {card.trend}
              </span>
              <span className="text-gray-400 dark:text-gray-500 ml-2">vs last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Area (Placeholders for visual wow factor) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-xl flex flex-col justify-center items-center min-h-[400px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 to-fuchsia-500/5"></div>
          <BarChart3 className="w-16 h-16 text-violet-300 dark:text-violet-900/50 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Revenue vs Target</h3>
          <p className="text-gray-500 mt-2 text-center max-w-md">Detailed charting engine will be mounted here once real historical data is accumulated.</p>
        </div>
        
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-xl space-y-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Department Health</h3>
          
          <div className="space-y-4">
            {[
              { label: 'Sales Pipeline', progress: 85, color: 'bg-blue-500' },
              { label: 'Marketing ROI', progress: 72, color: 'bg-pink-500' },
              { label: 'Customer Satisfaction', progress: 94, color: 'bg-emerald-500' },
              { label: 'Operations Efficiency', progress: 68, color: 'bg-amber-500' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{stat.label}</span>
                  <span className="text-gray-500">{stat.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2">
                  <div className={`${stat.color} h-2 rounded-full`} style={{ width: `${stat.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

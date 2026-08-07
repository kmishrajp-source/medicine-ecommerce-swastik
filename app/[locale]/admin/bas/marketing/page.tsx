'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Target, Search, Filter, Plus, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function MarketingDashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/bas/marketing/campaigns')
      .then(res => res.json())
      .then(data => {
        setCampaigns(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800 animate-pulse">Active</span>;
      case 'DRAFT': return <span className="px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full text-xs font-bold uppercase tracking-wider border border-gray-200 dark:border-gray-700">Draft</span>;
      case 'PAUSED': return <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-800">Paused</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full text-xs font-bold uppercase tracking-wider border border-gray-200 dark:border-gray-700">{status}</span>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg shadow-pink-500/30">
            <Megaphone className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
              Marketing Hub
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage campaigns, track conversions, and maximize ROI</p>
          </div>
        </div>
        
        <div className="flex space-x-3 w-full md:w-auto">
           <button className="flex items-center space-x-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-pink-500/25 transition-all hover:scale-105 active:scale-95 font-medium">
            <Plus className="w-5 h-5" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* Campaign Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-pink-50 dark:from-slate-900 dark:to-slate-800/80 backdrop-blur-xl p-6 rounded-3xl border border-pink-100 dark:border-pink-900/30 shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider text-sm">Active Campaigns</h3>
            <Target className="w-6 h-6 text-pink-500" />
          </div>
          <p className="text-4xl font-black text-gray-900 dark:text-white">
            {loading ? '-' : campaigns.filter(c => c.status === 'ACTIVE').length}
          </p>
          <div className="mt-4 flex items-center text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+2 since last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-slate-800/80 backdrop-blur-xl p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30 shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider text-sm">Total Reach</h3>
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-4xl font-black text-gray-900 dark:text-white">
            {loading ? '-' : campaigns.reduce((acc, curr) => acc + (curr.impressions || 0), 0).toLocaleString()}
          </p>
          <div className="mt-4 flex items-center text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>15% growth</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-slate-800/80 backdrop-blur-xl p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider text-sm">Campaign Revenue</h3>
            <DollarSign className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-4xl font-black text-gray-900 dark:text-white">
            ₹{loading ? '-' : campaigns.reduce((acc, curr) => acc + (curr.revenue || 0), 0).toLocaleString()}
          </p>
          <div className="mt-4 flex items-center text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>High ROI generated</span>
          </div>
        </div>
      </div>

      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button className="p-3 bg-white/60 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Budget / Spend</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading campaigns...</td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No campaigns launched yet.</td>
                </tr>
              ) : (
                campaigns.map((camp: any) => (
                  <tr key={camp.id} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{camp.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Audience: {camp.targetAudience || 'All'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{camp.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(camp.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex justify-between w-32"><span className="text-gray-500">Impressions:</span> <span className="font-semibold text-gray-700 dark:text-gray-300">{camp.impressions?.toLocaleString() || 0}</span></div>
                        <div className="flex justify-between w-32"><span className="text-gray-500">Clicks:</span> <span className="font-semibold text-gray-700 dark:text-gray-300">{camp.clicks?.toLocaleString() || 0}</span></div>
                        <div className="flex justify-between w-32"><span className="text-gray-500">Conversions:</span> <span className="font-semibold text-gray-700 dark:text-gray-300">{camp.conversions?.toLocaleString() || 0}</span></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm font-medium text-gray-900 dark:text-gray-100">₹{camp.cost || 0} <span className="text-xs font-normal text-gray-400">/ ₹{camp.budget || 0}</span></div>
                       {camp.budget > 0 && (
                         <div className="w-24 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                           <div className="h-full bg-pink-500" style={{ width: `${Math.min((camp.cost / camp.budget) * 100, 100)}%` }}></div>
                         </div>
                       )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                       <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{camp.revenue || 0}</div>
                       {camp.cost > 0 && (
                          <div className="text-xs text-gray-500 mt-1">ROI: {((camp.revenue - camp.cost) / camp.cost * 100).toFixed(0)}%</div>
                       )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
